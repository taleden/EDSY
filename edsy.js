/*
E:D Shipyard (EDSY) was created using assets and imagery from Elite: Dangerous, with the permission of Frontier Developments plc, for non-commercial purposes.
It is not endorsed by nor reflects the views or opinions of Frontier Developments and no employee of Frontier Developments was involved in the making of it.

Except where noted otherwise, all design, markup and script code for EDSY is copyright (c) 2015-2019 taleden
and is provided under a Creative Commons Attribution-NonCommercial 4.0 International License (http://creativecommons.org/licenses/by-nc/4.0/).

The Elite: Dangerous game logic and data in this file remains the property of Frontier Developments plc,
and is used here as authorized by Frontier Customer Services (https://forums.frontier.co.uk/showthread.php?t=5349).
*/
'use strict';
window.edshipyard = new (function() {
	var VERSIONS = [34118,34118,34117,34118]; /* HTML,CSS,DB,JS */
	
	var EMPTY_OBJ = {};
	var EMPTY_ARR = [];
	var TIMEOUT_RESIZE = 300;
	var TIMEOUT_DBLCLICK = 300;
	var TIMEOUT_LONGPRESS = 500;
	var TOLERANCE_TOUCH = 10;
	var GROUPS = ['hardpoint','utility','component','military','internal'];
	var GROUP_LABEL = { hardpoint:'Hardpoints', utility:'Utility Mounts', component:'Core Internal', military:'Military', internal:'Optional Internal' };
	var CORE_SLOT_NAME = ['Bulkhead', 'Power Plant', 'Thruster', 'Frame Shift Drive', 'Life Support', 'Power Distributor', 'Sensors', 'Fuel Tank'];
	var CORE_SLOT_ABBR = ['BH','PP','TH','FD','LS','PD','SS','FT'];
	var CORE_ABBR_SLOT = { BH:0,PP:1,TH:2,FD:3,LS:4,PD:5,SS:6,FT:7,
	                            RB:1,TM:2,FH:3,EC:4,PC:5,     FS:7 };
	var BOOST_MARGIN = 0.005;
	var SHIP_HATCH_ID = 49180;
	var MAX_SLOT_CLASS = 8;
	var MAX_POWER_DIST = 8;
	var TOTAL_POWER_DIST = 12;
	var MAX_POWER_PRIORITY = 5;
	var MAX_BLUEPRINT_GRADE = 5;
	var MAX_DAMAGED_PWRCAP = 0.5;
	var MIN_MODIFIER = 0.00005;
	var DISCOUNTS = [30,20,15,10,5,2.5];
	var HASH_VERSION = 14;
	var HTML_ICON = {
		'unknown'    : '<svg class="iconsvg unknown"><use xlink:href="#icon_unknown"/></svg>',
		'warning'    : '<svg class="iconsvg warning tinted"><use xlink:href="#icon_warning"/></svg>',
		'save'       : '<svg class="iconsvg save"><use xlink:href="#icon_save"/></svg>',
		'saveas'     : '<svg class="iconsvg saveas"><use xlink:href="#icon_saveas"/></svg>',
		'reload'     : '<svg class="iconsvg reload"><use xlink:href="#icon_reload"/></svg>',
		'rename'     : '<svg class="iconsvg rename"><use xlink:href="#icon_rename"/></svg>',
		'delete'     : '<svg class="iconsvg delete"><use xlink:href="#icon_delete"/></svg>',
		'engineer'   : '<svg class="iconsvg engineer"><use xlink:href="#icon_engineer"/></svg>',
		'fixed'      : '<svg class="iconsvg fixed"><use xlink:href="#icon_fixed"/></svg>',
		'gimballed'  : '<svg class="iconsvg gimballed"><use xlink:href="#icon_gimballed"/></svg>',
		'turreted'   : '<svg class="iconsvg turreted"><use xlink:href="#icon_turreted"/></svg>',
		'dumbfire'   : '<svg class="iconsvg dumbfire"><use xlink:href="#icon_dumbfire"/></svg>',
		'seeker'     : '<svg class="iconsvg seeker"><use xlink:href="#icon_seeker"/></svg>',
		'guardian'   : '<svg class="iconsvg guardian tinted"><use xlink:href="#icon_guardian"/></svg>',
	};
	var HTML_ICON_MOUNT = { F:HTML_ICON['fixed'], G:HTML_ICON['gimballed'], T:HTML_ICON['turreted'] };
	var HTML_ICON_MISSILE = { D:HTML_ICON['dumbfire'], S:HTML_ICON['seeker'] };
	var HTML_ICON_TAG = { G:HTML_ICON['guardian'] };
	
	
	var cache = {
		formatNumText: {},
		formatPctText: {},
		feature: {},
		ships: [],
		shipBuild: {},
		shipHash: {},
		shipModules: {},
		groupMtypes: {},
		mtypeModules: {},
		mtypeSizeGaps: {},
		mtypeBlueprints: {},
		mtypeExpeffects: {},
		moduleHash: {},
		hashVersionMap: {},
		storedmodules: {},
		discountMod: {},
		discounts: [],
	};
	var current = {
		beta: false,
		hashlock: false,
		popup: {
			element: null,
			trigger: null,
			refocus: null,
			sticky: null,
			onOkay: null,
			onCancel: null,
		},
		drag: null,
		resize: null,
		pickerClick: {},
		pickerTouch: {},
		slotsClick: {},
		slotsTouch: {},
		storedbuild: { 0:{} },
		storedmodule: { 0:{} },
		option: {
			onlybest: false,
			experimental: false,
		},
		page: null,
		shipyard_tab: null,
		tab: null,
		fit: null,
		outfitting_onecol: false,
		outfitting_focus: null,
		outfitting_mode: null,
		outfitting_show1: null,
		outfitting_show2a: null,
		outfitting_show2b: null,
		pickerSlot: null,
		tempSlot: null,
		group: null,
		slot: null,
	};
	
	
	var
		LN2 = Math.LN2,
		LN10 = Math.LN10,
		abs = Math.abs,
		ceil = Math.ceil,
		exp = Math.exp,
		floor = Math.floor,
		log = Math.log,
		max = Math.max,
		min = Math.min,
		pow = Math.pow,
		random = Math.random,
		round = Math.round,
		sign = Math.sign,
		sqrt = Math.sqrt
	;
	var
		atanh = Math.atanh || function(x) {
			return (log((1 + x) / (1 - x)) / 2);
		},
		tanh = Math.tanh || function(x) {
			var a = exp(+x), b = exp(-x);
			return ((a == Infinity) ? 1 : ((b == Infinity) ? -1 : ((a - b) / (a + b))));
		},
		clone = Object.assign || function(tgt, src) {
			if (src) {
				for (var key in src) {
					if (src.hasOwnProperty(key)) {
						tgt[key] = src[key];
					}
				}
			}
			return tgt;
		},
		contains = function(lst, itm) {
			var i = lst.length;
			while (i-- > 0) {
				if (lst[i] === itm)
					return true;
			}
			return false;
		}
	;
	
	
	/*
	* UTILITY FUNCTIONS
	*/
	
	
	var setDOMSelectLength = function(select, length) {
		while (select.length < length)
			select.options.add(document.createElement('option'));
		while (select.length > length)
			select.options.remove(select.options.length - 1);
	}; // setDOMSelectLength()
	
	
	var encodeHTML = function(text) {
		return text.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&apos;').replace(/\//g, '&sol;');
	}; // encodeHTML()
	
	
	var formatNumText = ((window.Intl && window.Intl.NumberFormat)
		? (
			function(num, dec) {
				return (cache.formatNumText[dec] || (
					cache.formatNumText[dec] = (new window.Intl.NumberFormat(undefined, { style:'decimal', useGrouping:true,  minimumIntegerDigits:1, minimumFractionDigits:dec, maximumFractionDigits:dec })).format
				))(num);
			}
		) : (
			function(num, dec) {
				if (!isFinite(num))
					return n.toFixed(dec);
				var parts = num.toFixed(dec).split('.');
				var o = '';
				var s = parts[0];
				var i = L = s.length;
				while (i-- > 0)
					o = ((i && !((L - i) % 3)) ? ',' : '') + s[i] + o;
				return o + (dec ? ('.' + parts[1]) : '');
			}
		)
	); // formatNumText()
	
	
	var formatPctText = ((window.Intl && window.Intl.NumberFormat)
		? (
			function(num, dec) {
				return (cache.formatPctText[dec] || (
					cache.formatPctText[dec] = (new window.Intl.NumberFormat(undefined, { style:'percent', useGrouping:false,  minimumIntegerDigits:1, minimumFractionDigits:dec, maximumFractionDigits:dec })).format
				))(num);
			}
		) : (
			function(num, dec) {
				return (num * 100).toFixed(0) + '%';
			}
		)
	); // formatPctText()
	
	
	var formatNumHTML = function(num, dec) {
		if (num === undefined)
			return '';
		var text = (isFinite(num) ? formatNumText(((num === num) ? num : 0), dec) : '&infin;');
		if (num !== num)
			text = '<abbr class="unknown" title="Unknown!">' + text.replace(/0/g,'?') + '</abbr>';
		return text;
	}; // formatNumHTML()
	
	
	var formatPctHTML = function(num, dec) {
		if (num === undefined)
			return '';
		var text = (isFinite(num) ? formatPctText(((num === num) ? num : 0), dec).replace('%', '<small class="semantic">%</small>') : '&infin;');
		if (num !== num)
			text = '<abbr class="unknown" title="Unknown!">' + text.replace(/0/g,'?') + '</abbr>';
		return text;
	}; // formatPctHTML()
	
	
	var formatTimeHTML = function(sec, brief) {
		if (sec !== sec)
			return formatNumHTML(NaN, 1);
		if (!isFinite(sec))
			return formatNumHTML(sec, 0);
		
		var s = (sec % 60);
		var m = (sec / 60) | 0;
		var h = (m / 60) | 0;
		m = (m % 60) | 0;
		
	//	return ((sec >= 10) ? ((h ? (h.toFixed(0) + ':') : '') + ((h && m < 10) ? '0' : '') + m.toFixed(0) + ':' + (((h || m) && s < 10) ? '0' : '') + s.toFixed(0)) : s.toFixed(1));
		
		if (brief) {
			if (h) return (((h < 10) ? (h+(m/60)).toFixed(1) : h.toFixed(0)) + '<small class="semantic">h</small>');
			if (m) return (((m < 10) ? (m+(s/60)).toFixed(1) : m.toFixed(0)) + '<small class="semantic">m</small>');
			return (((h && !m) ? '0<small class="semantic">m</small>' : '') + s.toFixed((sec < 10) ? 1 : 0) + '<small class="semantic">s</small>');
		}
		var html = '';
		if (h) html += (h.toFixed(0) + '<small class="semantic">h</small>');
		if (m) html += (m.toFixed(0) + '<small class="semantic">m</small>');
		if (h && !m) html += '0<small class="semantic">m</small>';
		html += (s.toFixed((sec < 10) ? 1 : 0) + '<small class="semantic">s</small>');
		return html;
	}; // formatTimeHTML()
	
	
	var formatPriceHTML = function(num, brief) {
		if (num !== num || !isFinite(num))
			return formatNumHTML(num, 0);
		if (!brief)
			return (formatNumHTML(num, 0) + '<small>CR</small>');
		var n = num;
		var k = 0;
		while (brief && n > 1000) {
			n /= 1000;
			k++;
		}
		return ('<abbr title="' + formatNumHTML(num, 0) + ' CR">' + n.toFixed((n < 10) ? 2 : ((n < 100) ? 1 : 0)) + (['',' K',' M',' B',' T'][k] || '') + '</abbr><small>CR</small>');
	}; // formatPriceHTML()
	
	
	var formatAttrLabelHTML = function(attr, abbr, desc) {
		var attribute = (eddb.attribute[attr] || EMPTY_OBJ);
		return '<abbr class="attribute" title="' + (desc || attribute.desc || '') + '">' + (abbr || attribute.abbr || attr) + ':</abbr>';
	}; // formatAttrLabelHTML()
	
	
	var formatAttrHTML = function(attr, value, dec) {
		var attribute = (eddb.attribute[attr] || EMPTY_OBJ);
		if (dec === undefined)
			dec = attribute.scale;
		if (value !== value)
			return formatNumHTML(NaN, dec);
		if (attribute.unit === '%')
			return formatPctHTML(value / 100, dec);
		if (attribute.time)
			return formatTimeHTML(value);
		return (((dec !== undefined) ? formatNumHTML(value, dec) : value) + ((attribute.unit && isFinite(value)) ? ('<small>' + attribute.unit + '</small>') : ''));
	}; // formatAttrHTML()
	
	
	var HASH_NUM_CHR = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-';
	var HASH_CHR_NUM = {};
	for (var i = 0;  i < HASH_NUM_CHR.length;  i++)
		HASH_CHR_NUM[HASH_NUM_CHR[i]] = i;
	var HASHT_NUM_CHR = ' !"#$%&'+"'"+'()*+,-./:;<=>?@[\\]^_`{|}~';
	var HASHT_CHR_NUM = {};
	for (var i = 0;  i < HASHT_NUM_CHR.length;  i++)
		HASHT_CHR_NUM[HASHT_NUM_CHR[i]] = i;
	
	
	var hashEncode = function(n, l) {
		var h = '';
		while (n) {
			h = HASH_NUM_CHR[n & 0x3F] + h;
			n = n >> 6;
		}
		while (h.length < l)
			h = HASH_NUM_CHR[0] + h;
		return h;
	}; // hashEncode()
	
	
	var hashDecode = function(h) {
		var n=0, i=0;
		while (i < h.length)
			n = (n << 6) | (HASH_CHR_NUM[h[i++]] || 0);
		return n;
	}; // hashDecode()
	
	
	var hashEncodeS = function(s) {
		var h='', i=0, c;
		for (var i = 0;  i < s.length;  i++) {
			c = s.charCodeAt(i);
			if (c >= 0x20 && c <= 0xFFF) {
				h += HASH_NUM_CHR[c >> 6] + HASH_NUM_CHR[c & 0x3F];
			}
		}
		return h;
	}; // hashEncodeS()
	
	
	var hashDecodeS = function(h) {
		var s='', i=1, c1, c2;
		for (var i = 1;  i < h.length;  i += 2) {
			c1 = HASH_CHR_NUM[h[i - 1]] || 0;
			c2 = HASH_CHR_NUM[h[i]] || 0;
			s += String.fromCharCode((c1 << 6) | c2);
		}
		return s;
	}; // hashDecodeS()
	
	
	var hashEncodeT = function(t) {
		var h='', i=0, c;
		for (var i = 0;  i < t.length;  i++) {
			if ((c = HASH_CHR_NUM[t[i]]) !== undefined && c < 62) {
				h += t[i];
			} else if ((c = HASHT_CHR_NUM[t[i]]) !== undefined) {
				h += HASH_NUM_CHR[62] + HASH_NUM_CHR[c];
			} else if ((c = t.charCodeAt(i) - 0x7F) >= 0 && c <= 0xFFF) {
				h += HASH_NUM_CHR[63] + HASH_NUM_CHR[c >> 6] + HASH_NUM_CHR[c & 0x3F];
			}
		}
		return h;
	}; // hashEncodeT()
	
	
	var hashDecodeT = function(h) {
		var t='', i=0, c1, c2;
		while (i < h.length) {
			c1 = HASH_CHR_NUM[h[i++]];
			if (c1 !== undefined && c1 < 62) {
				t += HASH_NUM_CHR[c1];
			} else if (c1 == 62) {
				c2 = HASH_CHR_NUM[h[i++]] || 0;
				t += HASHT_NUM_CHR[c2];
			} else if (c1 == 63) {
				c1 = HASH_CHR_NUM[h[i++]] || 0;
				c2 = HASH_CHR_NUM[h[i++]] || 0;
				t += String.fromCharCode(((c1 << 6) | c2) + 0x7F);
			}
		}
		return t;
	}; // hashDecodeT()
	
	
	var fixed20Encode = function(n) {
		return min(max((n * (1 << 17) + 0.5) | 0, 0), 0xFFFFF);
	}; // fixed20Encode()
	

	var fixed20Decode = function(n) {
		return (1.0 * n / (1 << 17));
	}; // fixed20Decode()
	
	
	var float20Encode = function(f) {
		// this is a custom 20-bit floating point format based on the design of IEEE 16- and 32-bit floats
		// yes, it's probably a little silly to invent a custom data type just for a fan site,
		// but 16 bits just isn't quite enough precision to encode engineer attribute modifiers
		// and 32 bits would unnecessarily inflate the length of URL hashes, so here we are --taleden
		var s = (f < 0) | 0;
		f = (f < 0) ? -f : f;
		var m = f | 0;
		var e = ((1 << 5) - 1);
		if (isNaN(f)) { // NaN
			m = 1;
		} else if (f > ((1 << 15) - 1)) { // +/- Infinity
			m = 0;
		} else {
			e -= 1;
			f -= m;
			while (m < (1 << 14) && e > 0) {
				m <<= 1;
				e -= 1;
				f *= 2;
				if (f >= 1) {
					m |= 1;
					f -= 1;
				}
			}
			if (e == 0) {
				m = (m >> 1) + (m & 1);
				e = (m >= (1 << 15));
			} else if (f * 2 >= 1) {
				m += 1;
				if (m >= (1 << 15)) {
					m >>= 1;
					e += 1;
				}
			}
		}
		s &= 1;
		e &= ((1 << 5) - 1);
		m &= ((1 << 14) - 1);
		return (s << 19) | (e << 14) | m;
	}; // float20Encode()
	
	
	var float20Decode = function(b) {
		var s = (b >> 19) & 1;
		var e = (b >> 14) & ((1 << 5) - 1);
		var m = b & ((1 << 14) - 1);
		return (e >= ((1 << 5) - 1)) ? (m ? NaN : (s ? -Infinity : Infinity)) : ((s ? -1 : 1) * pow(2.0, e - ((1 << 5) - 2) + (e == 0)) * ((e ? (1 << 14) : 0) | m));
	}; // float20Decode()
	
	
	/*
	* GAME FORMULAS
	*/
	
	
	var getJumpFuelCost = function(mass, dist, fsdOpt, fsdMul, fsdExp) {
		// https://forums.frontier.co.uk/showthread.php?p=643461#post643461
		return fsdMul * pow(dist * mass / fsdOpt, fsdExp);
	}; // getJumpFuelCost()
	
	
	var getJumpDistance = function(mass, fuel, fsdOpt, fsdMul, fsdExp, jmpBst) {
		// https://forums.frontier.co.uk/showthread.php?p=643461#post643461
		return pow(fuel / fsdMul, 1 / fsdExp) * fsdOpt / mass + jmpBst;
	}; // getJumpDistance()
	
	
	var getJumpRange = function(fuelcap, mass, fuel, fsdOpt, fsdMul, fsdExp, jmpBst) {
		var range = 0;
		while (fuelcap > fuel) {
			range += getJumpDistance(mass, fuel, fsdOpt, fsdMul, fsdExp, jmpBst);
			fuelcap -= fuel;
			mass -= fuel;
		}
		return range + getJumpDistance(mass, fuelcap, fsdOpt, fsdMul, fsdExp, jmpBst);
	}; // getJumpRange()
	
	
	var getMassCurveMultiplier = function(mass, minMass, optMass, maxMass, minMul, optMul, maxMul) {
		// https://forums.frontier.co.uk/showthread.php/300225-The-One-Formula-To-Rule-Them-All-The-Mechanics-of-Shield-and-Thruster-Mass-Curves
		return (minMul + pow(min(1.0, (maxMass - mass) / (maxMass - minMass)), log((optMul - minMul) / (maxMul - minMul)) / log((maxMass - optMass) / (maxMass - minMass))) * (maxMul - minMul));
	}; // getMassCurveMultiplier()
	
	
	var getEffectiveDamageResistance = function(baseres, extrares) {
		// https://forums.frontier.co.uk/showthread.php/266235-Kinetic-Resistance-Calculation?p=4230114&viewfull=1#post4230114
		// https://forums.frontier.co.uk/showthread.php/286097-Shield-Booster-Mod-Calculator?p=4998592&viewfull=1#post4998592
		var res = 1 - ((1 - baseres / 100) * (1 - extrares / 100));
		var softcap = 1 - ((1 - baseres / 100) * (1 - 0.3));
		return 100 * (res - max(0, (res - softcap) / 2));
	}; // getEffectiveDamageResistance()
	
	
	var getEffectiveShieldBoostMultiplier = function(shieldbst) {
		// https://forums.frontier.co.uk/showthread.php/314820-(very)-Experimental-shield-change?p=4895068&viewfull=1#post4895068
		var i = (1 + (shieldbst / 100));
	//	i = min(i, (1 - exp(-0.7 * i)) * 2.5); // proposed during 2.3 beta, but not implemented
		return i;
	}; // getEffectiveShieldBoostMultiplier()
	
	
	var getPipDamageResistance = function(sys) {
		// https://forums.frontier.co.uk/showthread.php/341916-2-3-The-Commanders-Changelog
		return 60 * pow(sys / MAX_POWER_DIST, 0.85);
	}; // getPipDamageResistance()
	
	
	var getEquilibriumHeatLevel = function(heatdismax, thmload) {
		// https://forums.frontier.co.uk/showthread.php/286628-Research-Detailed-Heat-Mechanics
		// https://forums.frontier.co.uk/showthread.php/286628-Research-Detailed-Heat-Mechanics?p=6399855&viewfull=1#post6399855
		return sqrt(thmload / heatdismax);
	}; // getEquilibriumHeatLevel()
	
	
	var getTimeUntilHeatLevel = function(heatcap, heatdismax, thmload, heatlevel0, heatlevel) {
		// https://forums.frontier.co.uk/showthread.php/286628-Research-Detailed-Heat-Mechanics?p=6519883&viewfull=1#post6519883
		heatdismax /= heatcap;
		if (!thmload) {
			var C = -1 / (heatdismax * heatlevel0);
			return ((1 / (heatdismax * heatlevel)) + C);
		}
		thmload /= heatcap;
		var sqrtAdivB = sqrt(heatdismax / thmload);
		var sqrtAmulB = sqrt(heatdismax * thmload);
		var C = -atanh(heatlevel0 * sqrtAdivB) / sqrtAmulB
		return ((atanh(heatlevel * sqrtAdivB) / sqrtAmulB) + C);
	}; // getTimeUntilHeatLevel()
	
	
	var getHeatLevelAtTime = function(heatcap, heatdismax, thmload, heatlevel0, seconds) {
		// https://forums.frontier.co.uk/showthread.php/286628-Research-Detailed-Heat-Mechanics?p=6519883&viewfull=1#post6519883
		heatdismax /= heatcap;
		if (!thmload) {
			var C = -1 / (heatdismax * heatlevel0);
			return ((1 / (seconds - C)) / heatdismax);
		}
		thmload /= heatcap;
		var sqrtAdivB = sqrt(heatdismax / thmload);
		var sqrtAmulB = sqrt(heatdismax * thmload);
		var C = -atanh(heatlevel0 * sqrtAdivB) / sqrtAmulB
		return (tanh((seconds - C) * sqrtAmulB) / sqrtAdivB);
	}; // getHeatLevelAtTime()
	
	
	var getEffectiveWeaponThermalLoad = function(thmload, distdraw, wepcap, weplvl) {
		// https://forums.frontier.co.uk/showthread.php/286628-Research-Detailed-Heat-Mechanics?p=6408594&viewfull=1#post6408594
		return (thmload * (1 + 4 * min(max(1 - (wepcap * weplvl - distdraw) / wepcap, 0), 1)));
	}; // getEffectiveWeaponThermalLoad()
	
	
	/*
	* SHIP BUILDS
	*/
	
	
	var Slot = function(build, slotgroup, slotnum, modid) {
		if (!build || !(build instanceof Build))
			throw 'invalid parent build';
		this.build = build;
		this.slotgroup = null;
		this.slotnum = null;
		if (slotgroup) {
			var ship = eddb.ship[build.getShipID()];
			if (!ship || (slotgroup === 'ship' && slotnum !== 'hull' && slotnum !== 'hatch') || (slotgroup !== 'ship' && (!ship.slots[slotgroup] || slotnum < 0 || slotnum > ship.slots[slotgroup].length)))
				throw 'invalid ship slot group ' + slotgroup + ' or #' + slotnum;
			this.slotgroup = slotgroup;
			this.slotnum = slotnum;
		}
		this.hash = null;
		this.modid = 0;
		this.module = null;
		this.discounts = 0;
		this.powered = true;
		this.priority = 1;
		this.bpid = 0;
		this.bpgrade = 0;
		this.bproll = -1;
		this.expid = 0;
		this.modifier = null;
		if (modid) {
			if (!this.setModuleID(modid))
				throw 'invalid initial module id #' + modid;
		}
	}; // Slot
	
	
	Slot.prototype = {
		
		getSlotGroup: function() {
			return this.slotgroup;
		}, // getSlotGroup()
		
		
		getSlotNum: function() {
			return this.slotnum;
		}, // getSlotNum()
		
		
		clearHash: function() {
			this.hash = null;
			if (this.slotgroup) this.build.clearHash();
		}, // clearHash()
		
		
		clearStats: function() {
			this.clearHash();
			if (this.slotgroup) this.build.clearStats();
		}, // clearStats()
		
		
		isModuleIDValid: function(modid) {
			if (this.slotgroup === 'ship') return ((this.slotnum === 'hull' && modid == this.build.getShipID()) || (this.slotnum === 'hatch' && modid == SHIP_HATCH_ID)); // ship pseudogroup can only contain hull or cargo hatch
			if (!modid) return (this.slotgroup !== 'component'); // core components cannot be empty
			var module = eddb.module[modid];
			if (!module) return false; // module does not exist
			if (this.slotgroup && !((this.slotgroup === 'component') ? eddb.group.component[this.slotnum] : eddb.group[this.slotgroup]).mtypes[module.mtype]) return false; // group does not allow the module type
			return true;
		}, // isModuleIDValid()
		
		
		isModuleIDAllowed: function(modid) {
			if (!this.isModuleIDValid(modid)) return false; // module must be valid to be allowed
			if (!this.slotgroup || this.slotgroup === 'ship' || !modid) return true; // detached slots, ship pseudogroup slots, and empty slots are always allowed if they're valid
			var shipid = this.build.getShipID();
			var ship = eddb.ship[shipid];
			var slotsize = ship.slots[this.slotgroup][this.slotnum];
			var module = eddb.module[modid];
			if (module.class > slotsize) return false; // module is too large for the slot
			if (module.class < slotsize && this.slotgroup === 'component' && (this.slotnum == CORE_ABBR_SLOT.LS || this.slotnum == CORE_ABBR_SLOT.SS)) return false; // module is too small for the slot (i.e. life support, sensors)
			if (module.reserved && !module.reserved[shipid]) return false; // module does not allow the ship (i.e. fighter hangars, luxury cabins)
			var shipreserved = ((ship.reserved || EMPTY_OBJ)[this.slotgroup] || EMPTY_OBJ)[this.slotnum];
			if (shipreserved && !shipreserved[module.mtype]) return false; // slot does not allow the module type (i.e. Beluga/Orca/Dolphin cabins-only slots)
			return true;
		}, // isModuleIDAllowed()
		
		
		isEnough: function() {
			if (!this.slotgroup || this.slotgroup === 'ship' || !this.modid) return true; // detached slots, ship pseudogroup slots, and empty slots are always enough if they're allowed
			var ship = eddb.ship[this.build.getShipID()];
			if (((this.slotgroup === 'component' && this.slotnum == CORE_ABBR_SLOT.TH) || this.module.mtype === 'isg') && ship.mass > this.getEffectiveAttrValue('maxmass')) return false; // ship mass exceeds thruster/shieldgen maximum
			if (this.slotgroup === 'component' && this.slotnum == CORE_ABBR_SLOT.PD && ship.boostcost + BOOST_MARGIN > this.getEffectiveAttrValue('engcap')) return false; // ship boost cost exceeds distributor capacity
			return true;
		}, // isEnough()
		
		
		swapWith: function(slot2) {
			if (!slot2 || !(slot2 instanceof Slot) || (slot2.build !== this.build) || !this.slotgroup || (this.slotgroup === 'ship') || !slot2.slotgroup || (slot2.slotgroup === 'ship'))
				return false;
			var modid1 = this.modid;
			var modid2 = slot2.modid;
			if (!(current.option.experimental ? (this.isModuleIDValid(modid2) && slot2.isModuleIDValid(modid1)) : (this.isModuleIDAllowed(modid2) && slot2.isModuleIDAllowed(modid1))))
				return false;
			var slotgroup1 = this.slotgroup;
			var slotnum1 = this.slotnum;
			this.slotgroup = slot2.slotgroup;
			this.slotnum = slot2.slotnum;
			slot2.slotgroup = slotgroup1;
			slot2.slotnum = slotnum1;
			return true;
		}, // swapWith()
		
		
		getModuleID: function() {
			return this.modid;
		}, // getModuleID()
		
		
		getModule: function() {
			return this.module;
		}, // getModule()
		
		
		getModuleMtype: function() {
			return (this.module || EMPTY_OBJ).mtype;
		}, // getModuleMtype()
		
		
		setModuleID: function(modid) {
			if (!(current.option.experimental ? this.isModuleIDValid(modid) : this.isModuleIDAllowed(modid)))
				return false;
			this.modid = (modid | 0);
			this.module =  ((this.slotgroup === 'ship' && this.slotnum === 'hull') ? eddb.ship[modid] : this.build.getModule(modid));
			this.discounts = 0;
			this.bpid = 0;
			this.bpgrade = 0;
			this.bproll = -1;
			this.expid = 0;
			this.modifier = null;
			this.clearStats();
			return true;
		}, // setModuleID()
		
		
		getDiscounts: function() {
			return this.discounts;
		}, // getDiscounts()
		
		
		setDiscounts: function(discounts) {
			this.discounts = (discounts & ((1 << DISCOUNTS.length) - 1));
			this.clearStats();
			return true;
		}, // setDiscounts()
		
		
		getPowered: function() {
			return this.powered;
		}, // getPowered()
		
		
		setPowered: function(powered) {
			this.powered = !!powered;
			this.clearStats();
			return true;
		}, // setPowered()
		
		
		getPriority: function() {
			return this.priority;
		}, // getPriority()
		
		
		setPriority: function(priority) {
			this.priority = min(max(priority | 0, 1), 5);
			this.clearStats();
			return true;
		}, // setPriority()
		
		
		changePriority: function(delta) {
			return this.setPriority(((this.priority + (delta || 1) - 1) % 5) + 1);
		}, // changePriority()
		
		
		setBlueprint: function(bpid, bpgrade, bproll) {
			if (!this.modid || (this.slotgroup === 'ship'))
				return false;
			if (bpid === null) {
				bpid = this.bpid;
			}
			if (bpid) {
				var blueprint = eddb.blueprint[bpid];
				if (!blueprint)
					return false;
				if (this.module.noblueprints && (this.module.noblueprints['*'] || this.module.noblueprints[bpid]))
					return false;
				var mtype = eddb.mtype[this.module.mtype];
				if (!mtype.modifiable || !mtype.blueprints || mtype.blueprints.indexOf(bpid) < 0)
					return false;
				if (bpgrade === null) {
					bpgrade = (this.bpid ? ((this.bpgrade / eddb.blueprint[this.bpid].maxgrade * blueprint.maxgrade + 0.5) | 0) : blueprint.maxgrade);
				} else {
					bpgrade = min(max(bpgrade, 1), eddb.blueprint[bpid].maxgrade);
				}
				if (bproll === null) {
					bproll = this.bproll;
				}
				var modifier = this.modifier;
				if (bproll === null || bproll < 0) {
					bproll = -1;
					this.clearHash();
				} else {
					bproll = min(max(bproll, 0), 1);
					modifier = {};
					for (var a = 0;  a < mtype.modifiable.length;  a++) {
						var attr = mtype.modifiable[a];
						var attribute = eddb.attribute[attr];
						if (attribute && blueprint[attr] && (attribute.modset || attribute.modadd || attribute.modmod || getModuleAttrValue(this.module, attr))) {
							var himod = blueprint[attr][bpgrade - 1];
							var lomod = ((bpgrade > 1) ? blueprint[attr][bpgrade - 2] : ((himod && blueprint[attr][1]) ? (himod - (blueprint[attr][1] - himod)) : 0));
							modifier[attr] = (((himod < 0) === !attribute.bad) ? himod : (lomod + bproll * (himod - lomod))) / (attribute.modmod || ((attribute.modadd || attribute.modset) ? 1 : 100));
						}
					}
					// when modifying clip size, round up to a multiple of burst size
					if (modifier['ammoclip']) {
						var ammoclip = getModuleAttrValue(this.module, 'ammoclip') * (1 + modifier['ammoclip']);
						var bstsize = getModuleAttrValue(this.module, 'bstsize', modifier['bstsize']);
						modifier['ammoclip'] = getModuleAttrModifier(this.module, 'ammoclip', ceil(ammoclip / bstsize) * bstsize);
					}
					// when modifying damage falloff, cap at maximum range
					if (modifier['dmgfall']) {
						var maxrng = getModuleAttrValue(this.module, 'maxrng', modifier['maxrng']);
						var dmgfall = getModuleAttrValue(this.module, 'dmgfall', modifier['dmgfall']);
						modifier['dmgfall'] = getModuleAttrModifier(this.module, 'dmgfall', min(maxrng, dmgfall));
					}
					this.clearStats();
				}
				this.bpid = bpid;
				this.bpgrade = bpgrade;
				this.bproll = bproll;
				this.modifier = modifier;
			} else {
				this.bpid = 0;
				this.bpgrade = 0;
				this.bproll = -1;
				if (bproll === null || bproll < 0) {
					this.clearHash();
				} else {
					this.modifier = null;
					this.clearStats();
				}
			}
			return true;
		}, // setBlueprint()
		
		
		getBlueprintID: function() {
			return this.bpid;
		}, // getBlueprintID()
		
		
		setBlueprintID: function(bpid) {
			return this.setBlueprint(bpid, this.bpgrade, this.bproll);
		}, // setBlueprintID()
		
		
		getBlueprintGrade: function() {
			return this.bpgrade;
		}, // getBlueprintGrade()
		
		
		setBlueprintGrade: function(bpgrade) {
			return this.setBlueprint(this.bpid, bpgrade, this.bproll);
		}, // setBlueprintGrade()
		
		
		getBlueprintRoll: function() {
			return this.bproll;
		}, // getBlueprintRoll()
		
		
		setBlueprintRoll: function(bproll) {
			return this.setBlueprint(this.bpid, this.bpgrade, bproll);
		}, // setBlueprintRoll()
		
		
		getExpeffectID: function() {
			return this.expid;
		}, // getExpeffectID()
		
		
		setExpeffectID: function(expid) {
			if (!this.modid || (this.slotgroup === 'ship'))
				return false;
			if (expid) {
				if (!eddb.expeffect[expid])
					return false;
				if (this.module.noexpeffects && (this.module.noexpeffects['*'] || this.module.noexpeffects[expid]))
					return false;
				var mtype = eddb.mtype[this.module.mtype];
				if (!mtype.expeffects || mtype.expeffects.indexOf(expid) < 0)
					return false;
				this.expid = expid;
			} else {
				this.expid = 0;
			}
			this.clearStats();
			return true;
		}, // setExpeffectID()
		
		
		isModifiable: function() {
			return !!(this.modid && (this.slotgroup !== 'ship') && eddb.mtype[this.module.mtype].modifiable && (!this.module.noblueprints || !this.module.noblueprints['*']));
		}, // isModifiable()
		
		
		isModified: function() {
			return !!(this.modifier || this.expid);
		}, // isModified()
		
		
		getRelatedAttrModifier: function(attr) {
			switch (attr) {
			case 'cost':
				return (cache.discountMod[this.discounts] - 1);
				
			case 'rof':
				var rofBase = getModuleAttrValue(this.module, 'rof');
				if (!this.module || !isFinite(rofBase))
					return 0;
				var bstsize = this.getEffectiveAttrValue('bstsize');
				var bstrof = this.getEffectiveAttrValue('bstrof') || 1;
				var bstint = this.getEffectiveAttrValue('bstint');
				return (((bstsize / (((bstsize - 1) / bstrof) + bstint)) / rofBase) - 1);
				
			case 'srof':
				var srofBase = getModuleAttrValue(this.module, 'srof');
				if (!this.module || !isFinite(srofBase))
					return 0;
				var ammoclip = this.getEffectiveAttrValue('ammoclip');
				if (!ammoclip)
					return this.getRelatedAttrModifier('rof');
				if (this.expid === 'wpnx_aulo') // Auto Loader adds 1 round per 2 shots for an almost-but-not-quite +100% effective clip size
					ammoclip += ammoclip - 1;
				var bstsize = this.getEffectiveAttrValue('bstsize');
				var bstrof = this.getEffectiveAttrValue('bstrof');
				var bstint = this.getEffectiveAttrValue('bstint');
				var rldtime = this.getEffectiveAttrValue('rldtime');
				return (((ammoclip / ((ammoclip / bstrof) + (ceil(ammoclip / bstsize) * (bstint - (1 / bstrof))) - bstint + rldtime)) / srofBase) - 1);
				
			case 'dps':
			case 'sdps':
				return getAttrModifierSum(attr,
					getAttrModifierSum(attr,
						this.getEffectiveAttrModifier('damage'),
						this.getEffectiveAttrModifier(attr === 'dps' ? 'rof' : 'srof')
					),
					this.getEffectiveAttrModifier('rounds')
				);
				
			case 'eps':
			case 'seps':
				return getAttrModifierSum(attr,
					this.getEffectiveAttrModifier('distdraw'),
					this.getEffectiveAttrModifier(attr === 'eps' ? 'rof' : 'srof')
				);
				
			case 'hps':
			case 'shps':
				return getAttrModifierSum(attr,
					this.getEffectiveAttrModifier('thmload'),
					this.getEffectiveAttrModifier(attr === 'hps' ? 'rof' : 'srof')
				);
				
			case 'shotspd':
				return max(0, this.getEffectiveAttrModifier('maxrng'));
				
			case 'minmass':
			case 'maxmass':
				return (this.getModuleMtype() === 'isg') ? 0 : this.getEffectiveAttrModifier('optmass');
				
			case 'minmul':
			case 'maxmul':
			case 'minmulspd':
			case 'optmulspd':
			case 'maxmulspd':
			case 'minmulacc':
			case 'optmulacc':
			case 'maxmulacc':
			case 'minmulrot':
			case 'optmulrot':
			case 'maxmulrot':
				return this.getEffectiveAttrModifier('optmul');
			}
			return 0;
		}, // getRelatedAttrModifier()
		
		
		getBaseAttrValue: function(attr) {
			return getModuleAttrValue(this.module, attr);
		}, // getBaseAttrValue()
		
		
		getEffectiveAttrValue: function(attr) {
			return getModuleAttrValue(this.module, attr, this.getEffectiveAttrModifier(attr));
		}, // getEffectiveAttrValue()
		
		
		getEffectiveAttrModifier: function(attr) {
			// get base, related and experimental modifiers
			var modBase = ((this.modifier || EMPTY_OBJ)[attr] || 0);
			var modRel = this.getRelatedAttrModifier(attr);
			var modExp = ((eddb.expeffect[this.expid] || EMPTY_OBJ)[attr] || 0);
			if (modExp) {
				var attribute = eddb.attribute[attr];
				modExp /= ((attribute.modset || attribute.modadd) ? 1 : (attribute.modmod || 100));
			}
			
			// apply these modifiers in reverse; usually it doesn't matter, but for modset we want base to override related which overrides experimental
			return getAttrModifierSum(attr, getAttrModifierSum(attr, modExp, modRel), modBase);
		}, // getEffectiveAttrModifier()
		
		
		setEffectiveAttrModifier: function(attr, modifier) {
			if (attr === 'cost') {
				return this.setDiscounts(getClosestDiscount(1 + (modifier || 0)));
			} else if (attr === 'rof' || attr === 'srof') {
				// rof * (1 + rofmod) = bstsize / ((bstsize - 1) / bstrof + bstint * (1 + bstintmod))
				// (bstsize / (rof * (1 + rofmod)) - (bstsize - 1) / bstrof) / bstint - 1 = bstintmod
				var rof = getModuleAttrValue(this.module, 'rof');
				var bstsize = this.getEffectiveAttrValue('bstsize');
				var bstrof = this.getEffectiveAttrValue('bstrof');
				var bstint = getModuleAttrValue(this.module, 'bstint');
				// TODO: does this actually work for srof?
				attr = 'bstint';
				modifier = (bstsize / (rof * (1 + (modifier || 0))) - (bstsize - 1) / bstrof) / bstint - 1;
			}
			
			// get related and experimental modifiers
			var modRel = this.getRelatedAttrModifier(attr);
			var modExp = ((eddb.expeffect[this.expid] || EMPTY_OBJ)[attr] || 0);
			if (modExp) {
				var attribute = eddb.attribute[attr];
				modExp /= ((attribute.modset || attribute.modadd) ? 1 : (attribute.modmod || 100));
			}
			
			// set the base modifier (or clear if it's tiny, probably just a rounding error)
			var basemodifier = getAttrModifierDifference(attr, modifier, getAttrModifierSum(attr, modExp, modRel));
			if (abs(basemodifier) < MIN_MODIFIER)
				basemodifier = 0;
			return this.setAttrModifier(attr, basemodifier);
		}, // setEffectiveAttrModifier()
		
		
		setAttrModifier: function(attr, modifier) {
			if (!this.module)
				return false;
			if (attr === 'cost')
				return this.setDiscounts(getClosestDiscount(1 + (modifier || 0)));
			if (this.slotgroup === 'ship')
				return false;
			if (attr === 'rof' || attr === 'srof') {
				// rof * (1 + rofmod) = bstsize / ((bstsize - 1) / bstrof + bstint * (1 + bstintmod))
				// (bstsize / (rof * (1 + rofmod)) - (bstsize - 1) / bstrof) / bstint - 1 = bstintmod
				var rof = getModuleAttrValue(this.module, 'rof');
				var bstsize = getModuleAttrValue(this.module, 'bstsize');
				var bstrof = getModuleAttrValue(this.module, 'bstrof');
				var bstint = getModuleAttrValue(this.module, 'bstint');
				// TODO: does this actually work for srof?
				attr = 'bstint';
				modifier = (bstsize / (rof * (1 + (modifier || 0))) - (bstsize - 1) / bstrof) / bstint - 1;
			}
			if (!modifier) {
				if (this.modifier) {
					delete this.modifier[attr];
					var empty = true;
					for (var key in this.modifier) {
						empty = false;
						break;
					}
					if (empty)
						this.modifier = null;
					this.bproll = -1;
					this.clearStats();
				}
			} else {
				if (!isModuleAttrModifiable(this.module, attr))
					return false;
				if (!this.modifier)
					this.modifier = {};
				this.modifier[attr] = getModuleAttrModifier(this.module, attr, getModuleAttrValue(this.module, attr, modifier));
				this.bproll = -1;
				this.clearStats();
			}
			return true;
		}, // setAttrModifier()
		
		
		getHash: function(stored) {
			/*
			module hash format:
				<char 1-3>: module id (0..262143)
				<char 4>: slot flags
					0x20 <bit 1>: discounted?
					0x10 <bit 2>: modified?
					0x08 <bit 3>: powered?
					0x07 <bit 4-6>: priority (0..7)
				<char 5?>: discount bits
				<char 5-7 or 6-8>: engineering flags
					0x20000 <bit 1>: rolled?
					0xF<<13 <bit 2-5>: blueprint index (0..15)
					0x7<<10 <bit 6-8>: blueprint grade (0..7)
					0x1F<<5 <bit 9-13>: experimental index (0..31)
					0x1F <bit 14-18>: rolled ? (roll / 0.05) : (number of modifications)
				<char 8-11 or 9-12>: modified attribute
					0xF<<20 <bit 1-4>: attribute index (0..15)
					0xFFFFF <bit 5-24>: modifier
				<...>
			*/
			if (!this.module || (this.slotgroup === 'ship' && this.slotnum === 'hull'))
				return '';
			if (!this.hash) {
				var modidhash = hashEncode(this.modid & 0x1FFFF, 3);
				var mtype = (eddb.mtype[this.module.mtype] || EMPTY_OBJ);
				var bpidx = ((mtype.blueprints || EMPTY_ARR).indexOf(this.bpid) + 1);
				var expidx = ((mtype.expeffects || EMPTY_ARR).indexOf(this.expid) + 1);
				var mods = 0;
				var hash = '';
				var custom = ((bpidx < 1) || (this.bpgrade < 1) || (this.bproll < 0));
				if (!custom) {
					mods = (((this.bproll / 0.05) + 0.5) | 0);
				} else if (mtype.modifiable && this.modifier) {
					for (var a = 0;  a < mtype.modifiable.length;  a++) {
						var attr = mtype.modifiable[a];
						if (eddb.attribute[attr] && this.modifier[attr]) {
							mods++;
							hash += hashEncode(((a & 0xF) << 20) | (float20Encode(this.modifier[attr]) & 0xFFFFF), 4);
						}
					}
				}
				var modbits = ((custom ? 0 : 0x20000) | ((bpidx & 0xF) << 13) | ((this.bpgrade & 0x7) << 10) | ((expidx & 0x1F) << 5) | (mods & 0x1F));
				var modhash = (modbits ? (hashEncode(modbits, 3) + hash) : '');
				var slotbits = ((this.discounts ? 0x20 : 0) | (modhash ? 0x10 : 0) | (this.powered ? 0 : 0x8) | ((this.priority - 1) & 0x7));
				this.hash = (modidhash + hashEncode(slotbits, 1) + (this.discounts ? hashEncode(this.discounts, 1) : '') + modhash);
				this.storedhash = (hashEncode(HASH_VERSION, 1) + modidhash + hashEncode((modhash ? 0x10 : 0), 1) + modhash);
			}
			return (stored ? this.storedhash : this.hash);
		}, // getHash()
		
		
		getStoredHash: function() {
			return this.getHash(true);
		}, // getStoredHash()
		
		
		setHash: function(hash, version, errors) {
			var errortag;
			if (errors) errortag = (this.slotgroup ? ('Slot ' + this.slotgroup + ' ' + ((this.slotgroup === 'component') ? CORE_SLOT_ABBR[this.slotnum].toLowerCase() : (isNaN(this.slotnum) ? this.slotnum : (this.slotnum + 1))) + ': ') : '');
			if (this.slotgroup === 'ship' && this.slotnum === 'hull') {
				if (errors) errors.push(errortag + 'Cannot change ship hull');
				return false;
			}
			var idmap = Build.getHashVersionMap(version);
			var i = 0;
			
			// module id
			var modid = ((version < 12 && this.slotgroup === 'ship' && this.slotnum === 'hatch') ? SHIP_HATCH_ID : hashDecode(hash.slice(i, (i += ((version < 9 && this.slotgroup === 'component') ? 2 : 3)))));
			if (this.slotgroup === 'hardpoint') {
				modid = idmap.hardpoint[modid] || idmap.utility[modid] || modid;
			} else if (this.slotgroup === 'component') {
				modid = idmap.component[this.slotnum][modid] || modid;
			} else if (this.slotgroup) {
				modid = idmap[this.slotgroup][modid] || modid;
			}
			modid = max(0, (idmap.module[modid] || modid)) & 0x1FFFF;
			if (!this.setModuleID(modid)) {
				if (errors) errors.push(errortag + 'Invalid module id: ' + modid);
				return false;
			}
			
			// discounted, modified, powered and priority
			var slotbits = ((version < 8) ? 0 : hashDecode(hash.slice(i, (i += 1))));
			var discounted = (version < 14) ? 0 : (slotbits & 0x20);
			var modified = (slotbits & 0x10);
			var powered = !(slotbits & 0x8);
			var priority = (slotbits & 0x7) + 1;
			if (!this.setPowered(powered)) {
				if (errors) errors.push(errortag + 'Invalid powered setting: ' + powered);
			}
			if (!this.setPriority(priority)) {
				if (errors) errors.push(errortag + 'Invalid power priority setting: ' + priority);
			}
			
			// discounts
			if (discounted) {
				var discounts = hashDecode(hash.slice(i, (i += 1)));
				if (!this.setDiscounts(discounts)) {
					if (errors) errors.push(errortag + 'Invalid discounts: ' + discounts);
				}
			}
			
			// modification data
			var mtypeid = (this.module || EMPTY_OBJ).mtype;
			var mtype = (eddb.mtype[mtypeid] || EMPTY_OBJ);
			if (mtype.modifiable && modified) {
				var modbits = ((version < 9) ? 0 : hashDecode(hash.slice(i, (i += ((version < 12) ? 2 : 3)))));
				if (version < 12) {
					var bpidx = ((modbits >> 6) & 0x3F);
					var bpid = (bpidx ? (idmap.blueprint[mtypeid] || mtype.blueprints || EMPTY_ARR)[((bpidx % 10 + 0.5) | 0)] : 0);
					var bpgrade = ((bpidx / 10 + 0.5) | 0);
				} else {
					var bprolled = ((version < 14) ? false : (modbits & 0x20000));
					var bpidx = ((modbits >> 13) & ((version < 14) ? 0x1F : 0xF));
					var bpid = (idmap.blueprint[mtypeid] || mtype.blueprints || EMPTY_ARR)[bpidx - 1];
					var bpgrade = ((modbits >> 10) & 0x7);
				}
				var mods = ((version < 12) ? (modbits & 0x3F) : (modbits & 0x1F));
				var bproll = -1;
				if (bprolled) {
					bproll = (mods * 0.05);
					mods = 0;
				}
				var expidx = ((version < 12) ? 0 : ((modbits >> 5) & 0x1F));
				var expid = (idmap.expeffect[mtypeid] || mtype.expeffects || EMPTY_ARR)[expidx - 1];
				
				// set blueprint, grade, roll
				if (!this.setBlueprint(bpid, bpgrade, bproll)) {
					if (errors) errors.push(errortag + 'Invalid blueprint: '+bpid+' G'+bpgrade+' @'+bproll);
				}
				if (!this.setExpeffectID(expid)) {
					if (errors) errors.push(errortag + 'Invalid experimental effect: '+expid);
				}
				
				// attr mods
				var v9rof = 0;
				while (mods-- > 0) {
					var attrmod = hashDecode(hash.slice(i, (i += 4)));
					var attr = mtype.modifiable[((attrmod >> 20) & 0xF)];
					var attribute = eddb.attribute[attr];
					if (attribute) {
						var modifier = float20Decode(attrmod & 0xFFFFF);
						if (version < 9) {
							// several attributes were changed from modmul or modadd to modmod;
							// conversion thus depends on the base attribute values, so we have
							// to duplicate them here for affected modules to guard against them
							// possibly changing in the future and breaking the conversion
							if (attr === 'hullbst') {
								var v0 = {C:80,B:152,A:250}[this.module.rating] || getModuleAttrValue(this.module, attr);
								var v1 = v0 * (1 + modifier);
								modifier = (1 + (v1 / attribute.modmod)) / (1 + (v0 / attribute.modmod)) - 1;
							} else if (attr === 'shieldbst') {
								var v0 = {E:4,D:8,C:12,B:16,A:20}[this.module.rating] || getModuleAttrValue(this.module, attr);
								var v1 = v0 * (1 + modifier);
								modifier = (1 + (v1 / attribute.modmod)) / (1 + (v0 / attribute.modmod)) - 1;
							} else if (attr === 'kinres' || attr === 'thmres' || attr === 'expres') {
								if (mtypeid === 'cbh') {
									var v0 = ({1:{k:-20,t:0,e:-40},2:{k:-20,t:0,e:-40},3:{k:-20,t:0,e:-40},4:{k:-75,t:50,e:-50},5:{k:25,t:-40,e:20}}[modid % 10] || EMPTY_OBJ)[attr[0]] || getModuleAttrValue(this.module, attr);
								} else if (mtypeid === 'ihrp') {
									var v0 = [0,0.5,1,1.5,2,2.5][this.module.class] || getModuleAttrValue(this.module, attr);
								} else if (mtypeid === 'isg') {
									var v0 = {k:40,t:-20,e:50}[attr[0]] || getModuleAttrValue(this.module, attr);
								} else {
									var v0 = 0;
								}
								var v1 = v0 + modifier;
								modifier = (1 + (v1 / attribute.modmod)) / (1 + (v0 / attribute.modmod)) - 1;
							} else if (attr === 'bstsize') {
								// bstsize was changed from modadd to modset, but was only available on Frag Cannons
								// which all had base bstsize:1, so we can just add 1 to the old modifier
								modifier += 1;
							} else if (attr === 'bstint') {
								// all rof modifiers were changed in-place to bstint, so if that's what we detect,
								// we have to hang onto it and apply it later as a rof modifier so that it will be
								// adjusted for the burst values, which may also be modified in the mean time
								v9rof = modifier;
								continue;
							}
						}
						if (!this.setAttrModifier(attr, modifier)) {
							if (errors) errors.push(errortag + 'Invalid modification: '+attr+' '+modifier);
						}
					}
				}
				if (v9rof) {
					if (!this.setAttrModifier('rof', v9rof)) {
						if (errors) errors.push(errortag + 'Invalid modification: rof '+v9rof);
					}
				}
				if (version < 13 && mtypeid === 'iss' && bpid && bpgrade > 0) {
					// one-time conversion of surface scanner blueprints
					this.setAttrModifier('proberad', eddb.blueprint.iss_er.proberad[bpgrade - 1] / 100);
				}
			}
			
			this.clearStats();
			return true;
		}, // setHash()
		
		
		setStoredHash: function(modulehash, errors) {
			var version = hashDecode(modulehash.slice(0,1));
			var powered = this.getPowered();
			var priority = this.getPriority();
			var ok = this.setHash(modulehash.slice(1), version, errors);
			// this.setDiscounts(0); // TODO: save discounts in storedhash?
			this.setPowered(powered);
			this.setPriority(priority);
			return ok;
		}, // setStoredHash()
		
	}; // Slot.prototype
	
	
	Slot.getModuleIDStoredHash = function(modid) {
		return (hashEncode(HASH_VERSION, 1) + hashEncode(modid & 0x1FFFF, 3) + hashEncode(0, 1));
	}; // getModuleIDStoredHash()
	
	
	Slot.getStoredHashModuleID = function(modulehash) {
		var version = hashDecode(modulehash.slice(0,1));
		if (version < 9)
			return null;
		var idmap = Build.getHashVersionMap(version);
		var modid = hashDecode(modulehash.slice(1, 4));
		return (idmap.module[modid] || modid);
	}; // getStoredHashModuleID()
	
	
	var Build = function(shipid, stock) {
		var ship = eddb.ship[shipid];
		if (!ship)
			throw 'invalid ship id #' + shipid;
		this.hash = null;
		this.stats = null;
		this.shipid = shipid;
		this.name = '';
		this.nametag = '';
		this.crewdist = { sys:0, eng:0, wep:0 };
		this.powerdist = { sys:4, eng:4, wep:4 };
		this.slots = {
			ship : {
				hull  : new Slot(this, 'ship', 'hull', shipid),
				hatch : new Slot(this, 'ship', 'hatch', SHIP_HATCH_ID),
			},
		};
		for (var slotgroup in ship.slots) {
			this.slots[slotgroup] = [];
			for (var slotnum = 0;  slotnum < ship.slots[slotgroup].length;  slotnum++) {
				var modid = ((slotgroup === 'component' || stock) ? ship.stock[slotgroup][slotnum] : 0);
				var discounts = 0;
				if (modid < 0) {
					modid = -modid;
					discounts = 0x3F;
				}
				var slot = new Slot(this, slotgroup, slotnum, modid);
				this.slots[slotgroup].push(slot);
				slot.setDiscounts(discounts);
			}
		}
	}; // Build
	
	
	Build.prototype = {
		
		clearHash: function() {
			this.hash = null;
		}, // clearHash()
		
		
		clearStats: function() {
			this.clearHash();
			this.stats = null;
		}, // clearStats()
		
		
		getShipID: function() {
			return this.shipid;
		}, // getShipID()
		
		
		getModule: function(modid) {
			return (cache.shipModules[this.shipid][modid] || eddb.module[modid]);
		}, // getModule()
		
		
		getName: function() {
			return this.name;
		}, // getName()
		
		
		setName: function(name) {
			this.name = name.slice(0,22).toUpperCase();
			this.clearHash();
			return true;
		}, // setName()
		
		
		getNameTag: function() {
			return this.nametag;
		}, // getNameTag()
		
		
		setNameTag: function(nametag) {
			this.nametag = nametag.slice(0,6).toUpperCase();
			this.clearHash();
			return true;
		}, // setNameTag()
		
		
		getCrewDist: function(dist) {
			if (dist)
				return this.crewdist[dist];
			return {
				sys:this.crewdist.sys,
				eng:this.crewdist.eng,
				wep:this.crewdist.wep,
			};
		}, // getCrewDist()
		
		
		setCrewDist: function(sys, eng, wep) {
			var maxcrew = (this.getSlot('ship', 'hull').getEffectiveAttrValue('crew') - 1);
			this.crewdist.sys = sys = min(max(sys | 0, 0), maxcrew);
			this.crewdist.eng = eng = min(max(eng | 0, 0), maxcrew - sys);
			this.crewdist.wep = wep = min(max(wep | 0, 0), maxcrew - sys - eng);
			this.clearStats();
			return true;
		}, // setCrewDist()
		
		
		changeCrewDist: function(dist, delta) {
			var maxcrew = (this.getSlot('ship', 'hull').getEffectiveAttrValue('crew') - 1);
			var curcrew = (this.crewdist.sys + this.crewdist.eng + this.crewdist.wep);
			var distlist = ['sys','eng','wep'];
			var num = 0;
			var mod = 0;
			if (dist === 'avl') {
				if (delta < 0) {
					num = min(delta, maxcrew - curcrew);
					mod = 1;
				} else if (delta > 0) {
					num = min(delta, curcrew);
					mod = -1;
				}
			} else if (!(dist in this.crewdist)) {
				return false;
			} else if (delta < 0) {
				this.crewdist[dist] -= min(-delta, this.crewdist[dist]);
			} else if (delta > 0) {
				num = min(delta, maxcrew - this.crewdist[dist]);
				this.crewdist[dist] += num;
				num = max(0, num - (maxcrew - curcrew));
				mod = -1;
			}
			for (var d = 0;  num > 0;  d = ((d+1) % distlist.length)) {
				if (distlist[d] !== dist && ((mod < 0 && this.crewdist[distlist[d]] > 0) || (mod > 0 && this.crewdist[distlist[d]] < maxcrew))) {
					num--;
					this.crewdist[distlist[d]] += mod;
				}
			}
			num = MAX_POWER_DIST - (this.powerdist[dist] + (this.crewdist[dist] << 1));
			if (num < 0)
				this.changePowerDist(dist, num);
			return this.setCrewDist(this.crewdist.sys, this.crewdist.eng, this.crewdist.wep);
		}, // changeCrewDist()
		
		
		getPowerDist: function(dist) {
			if (dist)
				return this.powerdist[dist];
			return { sys:this.powerdist.sys, eng:this.powerdist.eng, wep:this.powerdist.wep };
		}, // getPowerDist()
		
		
		getEffectivePowerDist: function(dist) {
			if (dist)
				return min(MAX_POWER_DIST, this.powerdist[dist] + (this.crewdist[dist] << 1));
			return {
				sys:min(MAX_POWER_DIST, this.powerdist.sys + (this.crewdist.sys << 1)),
				eng:min(MAX_POWER_DIST, this.powerdist.eng + (this.crewdist.eng << 1)),
				wep:min(MAX_POWER_DIST, this.powerdist.wep + (this.crewdist.wep << 1)),
			};
		}, // getEffectivePowerDist()
		
		
		setPowerDist: function(sys, eng, wep) {
			this.powerdist.sys = sys = min(max(sys | 0, 0                                           ), MAX_POWER_DIST);
			this.powerdist.eng = eng = min(max(eng | 0, 0, (TOTAL_POWER_DIST - MAX_POWER_DIST) - sys), MAX_POWER_DIST, TOTAL_POWER_DIST - sys);
			this.powerdist.wep = TOTAL_POWER_DIST - sys - eng;
			this.clearStats();
			return true;
		}, // setPowerDist()
		
		
		changePowerDist: function(dist0, delta) {
			if (!(dist0 in this.powerdist))
				return false;
			var dist1 = ((dist0 === 'sys') ? 'eng' : 'sys');
			var dist2 = ((dist0 === 'wep') ? 'eng' : 'wep');
			if (delta < 0) {
				var rem0 = min(-delta, this.powerdist[dist0]);
				var add1 = min(rem0 >> 1, MAX_POWER_DIST - this.powerdist[dist1] - (this.crewdist[dist1] << 1));
				var add2 = min(rem0 >> 1, MAX_POWER_DIST - this.powerdist[dist2] - (this.crewdist[dist2] << 1));
				var extra = rem0 - add1 - add2;
				if (this.powerdist[dist2] + (this.crewdist[dist2] << 1) < this.powerdist[dist1] + (this.crewdist[dist1] << 1)) {
					add2 += extra;
				} else {
					add1 += extra;
				}
				this.powerdist[dist0] -= rem0;
				this.powerdist[dist1] += add1;
				this.powerdist[dist2] += add2;
			} else if (delta > 0) {
				var add0 = min(delta, MAX_POWER_DIST - this.powerdist[dist0] - (this.crewdist[dist0] << 1));
				var rem1 = min(add0 >> 1, this.powerdist[dist1]);
				var rem2 = min(add0 >> 1, this.powerdist[dist2]);
				var extra = add0 - rem1 - rem2;
				if (this.powerdist[dist2] + (this.crewdist[dist2] << 1) > this.powerdist[dist1] + (this.crewdist[dist1] << 1)) {
					rem2 += extra;
				} else {
					rem1 += extra;
				}
				this.powerdist[dist0] += add0;
				this.powerdist[dist1] -= rem1;
				this.powerdist[dist2] -= rem2;
			}
			return this.setPowerDist(this.powerdist.sys, this.powerdist.eng, this.powerdist.wep);
		}, // changePowerDist()
		
		
		swapSlots: function(slotgroup1, slotnum1, slotgroup2, slotnum2) {
			if (!this.slots[slotgroup1] || !this.slots[slotgroup2] || slotgroup1 === 'ship' || slotgroup2 === 'ship')
				return false;
			var slot1 = this.slots[slotgroup1][slotnum1];
			var slot2 = this.slots[slotgroup2][slotnum2];
			if (!slot1 || !slot2 || !slot1.swapWith(slot2))
				return false;
			this.slots[slotgroup1][slotnum1] = slot2;
			this.slots[slotgroup2][slotnum2] = slot1;
			if ((slotgroup1 === 'component' && slotnum1 === CORE_ABBR_SLOT.FT) || (slotgroup2 === 'component' && slotnum2 === CORE_ABBR_SLOT.FT)) {
				this.clearStats();
			} else {
				this.clearHash();
			}
			return true;
		}, // swapSlots()
		
		
		copySlot: function(slotgroup1, slotnum1, slotgroup2, slotnum2) {
			if (!this.slots[slotgroup1] || !this.slots[slotgroup2] || slotgroup1 === 'ship' || slotgroup2 === 'ship')
				return false;
			var slot1 = this.slots[slotgroup1][slotnum1];
			var slot2 = this.slots[slotgroup2][slotnum2];
			if (!slot1 || !slot2)
				return false;
			slot2 = new Slot(this, slotgroup2, slotnum2, slot2.getModuleID());
			var errors = [];
			if (!slot2.setHash(slot1.getHash(), HASH_VERSION, errors))
				return false;
			this.slots[slotgroup2][slotnum2] = slot2;
			this.clearStats();
			return true;
		}, // copySlot()
		
		
		getDetachedSlot: function() {
			return new Slot(this);
		}, // getDetachedSlot()
		
		
		getSlot: function(slotgroup, slotnum) {
			return (this.slots[slotgroup] || EMPTY_OBJ)[slotnum];
		}, // getSlot()
		
		
		getLimitedSlots: function() {
			var limitSlots = {};
			for (var slotgroup in this.slots) {
				if (slotgroup !== 'ship') {
					var slot;
					for (var slotnum = 0;  slot = this.getSlot(slotgroup, slotnum);  slotnum++) {
						var limit = (slot.getModule() || EMPTY_OBJ).limit;
						if (limit) {
							if (!limitSlots[limit])
								limitSlots[limit] = [];
							limitSlots[limit].push(slot);
						}
					}
				}
			}
			return limitSlots;
		}, // getLimitedSlots()
		
		
		updateStats: function() {
			var stats = this.stats = {
				cost: 0,
				cost_vehicle: 0,
				cost_restock: 0,
				cost_rearm: 0,
				mass: 0,
				pwrcap: 0,
				pwrdraw_dep: [0,0,0,0,0,0],
				pwrdraw_ret: [0,0,0,0,0,0],
				thmload_ct: 0,
				thmload_cfsd: 0,
				thmload_hardpoint_wepfull: 0,
				thmload_hardpoint_wepempty: 0,
				thmload_iscb: 0,
				spinup_iscb: 0,
				jumpbst: 0,
				fuelcap: 0, 
				cargocap: 0,
				cabincap: 0,
				scooprate: 0,
				hullbst: 0,
				hullrnf: 0,
				shieldbst: 0,
				shieldrnf: 0,
				shieldrnfps: 0,
				shieldrnfps_ammomax: 0,
				integ_imrp: 0,
				dmgprot: 1,
				dps: 0,
				dps_abs: 0,
				dps_thm: 0,
				dps_kin: 0,
				dps_exp: 0,
				dps_axe: 0,
				dps_cau: 0,
				dps_nodistdraw: 0,
				dps_distdraw: 0,
				distdraw_second: 0,
				duration_wepcap: 1/0,
				duration_nocap: 1/0,
				wepchg_sustain_cur: 0,
				wepchg_sustain_max: 0,
			};
			var kinmod_ihrp = 1;
			var thmmod_ihrp = 1;
			var expmod_ihrp = 1;
			var caumod_ihrp = 1;
			var kinmod_usb = 1;
			var thmmod_usb = 1;
			var expmod_usb = 1;
			var caumod_usb = 1;
			
			// ship hull
			var slot_hull = this.getSlot('ship', 'hull');
			stats.cost += slot_hull.getEffectiveAttrValue('cost');
			stats.mass += slot_hull.getEffectiveAttrValue('mass');
			
			// cargo hatch
			var slot = this.getSlot('ship', 'hatch');
			stats.cost += slot.getEffectiveAttrValue('cost');
			var module = slot.getModule();
			if (module && slot.getPowered()) {
				var pwrdraw = slot.getEffectiveAttrValue('pwrdraw');
				var priority = slot.getPriority();
				stats.pwrdraw_dep[0] += pwrdraw;
				stats.pwrdraw_dep[priority] += pwrdraw;
				stats.pwrdraw_ret[0] += pwrdraw;
				stats.pwrdraw_ret[priority] += pwrdraw;
			}
			
			// all other modules
			var wepcap = this.getSlot('component', CORE_ABBR_SLOT.PD).getEffectiveAttrValue('wepcap');
			var slot_isg = null;
			for (var slotgroup in GROUP_LABEL) {
				for (var slotnum = 0;  slot = this.getSlot(slotgroup, slotnum);  slotnum++) {
					if (module = slot.getModule()) {
						var mtypeid = module.mtype;
						stats.cost += slot.getEffectiveAttrValue('cost');
						stats.cost_vehicle += slot.getEffectiveAttrValue('vslots') * slot.getEffectiveAttrValue('vcount') * (slot.getEffectiveAttrValue('ammocost') || 0);
						stats.mass += slot.getEffectiveAttrValue('mass');
						stats.pwrcap += slot.getEffectiveAttrValue('pwrcap');
						stats.fuelcap += slot.getEffectiveAttrValue('fuelcap');
						stats.cargocap += slot.getEffectiveAttrValue('cargocap');
						stats.cabincap += slot.getEffectiveAttrValue('cabincap');
						stats.hullbst += slot.getEffectiveAttrValue('hullbst');
						stats.hullrnf += slot.getEffectiveAttrValue('hullrnf');
						
						if (slotgroup === 'hardpoint') {
							stats.cost_rearm += (slot.getEffectiveAttrValue('ammoclip') + slot.getEffectiveAttrValue('ammomax')) * (slot.getEffectiveAttrValue('ammocost') || 0);
						} else if (slotgroup === 'utility') {
							stats.cost_restock += (slot.getEffectiveAttrValue('ammoclip') + slot.getEffectiveAttrValue('ammomax')) * (slot.getEffectiveAttrValue('ammocost') || 0);
						} else if (mtypeid === 'iafmu') {
							stats.cost_restock += slot.getEffectiveAttrValue('repaircap') * (slot.getEffectiveAttrValue('ammocost') || 0);
						} else if (mtypeid === 'imrp') {
							stats.integ_imrp += slot.getEffectiveAttrValue('integ');
							stats.dmgprot *= (1 - (slot.getEffectiveAttrValue('dmgprot') / 100));
						} else if (mtypeid === 'ihrp' || mtypeid === 'imahrp') {
							kinmod_ihrp *= (1 - (slot.getEffectiveAttrValue('kinres') / 100));
							thmmod_ihrp *= (1 - (slot.getEffectiveAttrValue('thmres') / 100));
							expmod_ihrp *= (1 - (slot.getEffectiveAttrValue('expres') / 100));
							caumod_ihrp *= (1 - (slot.getEffectiveAttrValue('caures') / 100));
						} else if (mtypeid === 'iscb') {
							stats.cost_restock += (slot.getEffectiveAttrValue('ammoclip') + slot.getEffectiveAttrValue('ammomax')) * (slot.getEffectiveAttrValue('ammocost') || 0);
						}
						
						var pwrdraw = slot.getEffectiveAttrValue('pwrdraw');
						if (!pwrdraw || slot.getPowered()) {
							var priority = slot.getPriority();
							stats.pwrdraw_dep[0] += pwrdraw;
							stats.pwrdraw_dep[priority] += pwrdraw;
							if (slotgroup !== 'hardpoint' && ((slotgroup !== 'utility') || module.passive)) {
								stats.pwrdraw_ret[0] += pwrdraw;
								stats.pwrdraw_ret[priority] += pwrdraw;
							}
							
							stats.jumpbst   += slot.getEffectiveAttrValue('jumpbst');
							stats.scooprate += slot.getEffectiveAttrValue('scooprate');
							stats.shieldbst += slot.getEffectiveAttrValue('shieldbst');
							stats.shieldrnf += slot.getEffectiveAttrValue('shieldrnf');
							
							var thmload = slot.getEffectiveAttrValue('thmload');
							if (slotgroup === 'hardpoint') {
								var distdraw = slot.getEffectiveAttrValue('distdraw');
								var rof = slot.getEffectiveAttrValue('rof');
								var ammoclip = slot.getEffectiveAttrValue('ammoclip');
								var ammomax = slot.getEffectiveAttrValue('ammomax');
								var rldtime = slot.getEffectiveAttrValue('rldtime');
								var cycletime = isFinite(rof) ? (rldtime ? (((ammoclip || 1) - 1) / rof + rldtime) : ((ammoclip || 1) / rof)) : 1;
								var ammotime = cycletime - rldtime + (ammoclip ? (cycletime * ammomax / ammoclip) : 1/0);
								var dps = slot.getEffectiveAttrValue('damage') * slot.getEffectiveAttrValue('rounds') * (ammoclip || 1) / cycletime;
								thmload *= (ammoclip || 1) / cycletime;
								
								stats.thmload_hardpoint_wepfull += getEffectiveWeaponThermalLoad(thmload, distdraw, wepcap, 1.0);
								stats.thmload_hardpoint_wepempty += getEffectiveWeaponThermalLoad(thmload, distdraw, wepcap, 0.0);
								
								stats.dps += dps;
								stats.dps_abs += dps * (slot.getEffectiveAttrValue('abswgt') / 100.0);
								stats.dps_thm += dps * (slot.getEffectiveAttrValue('thmwgt') / 100.0);
								stats.dps_kin += dps * (slot.getEffectiveAttrValue('kinwgt') / 100.0);
								stats.dps_exp += dps * (slot.getEffectiveAttrValue('expwgt') / 100.0);
								stats.dps_axe += dps * (slot.getEffectiveAttrValue('axewgt') / 100.0);
								stats.dps_cau += dps * (slot.getEffectiveAttrValue('cauwgt') / 100.0);
								if (distdraw) {
									stats.dps_distdraw += dps;
									stats.distdraw_second += distdraw * (ammoclip || 1) / cycletime;
									stats.duration_wepcap = min(stats.duration_wepcap, ammotime);
								} else {
									stats.dps_nodistdraw += dps;
									stats.duration_nocap = min(stats.duration_nocap, ammotime);
								}
							} else if (mtypeid === 'usb') {
								kinmod_usb *= (1 - (slot.getEffectiveAttrValue('kinres') / 100));
								thmmod_usb *= (1 - (slot.getEffectiveAttrValue('thmres') / 100));
								expmod_usb *= (1 - (slot.getEffectiveAttrValue('expres') / 100));
								caumod_usb *= (1 - (slot.getEffectiveAttrValue('caures') / 100));
							} else if (mtypeid === 'ct') {
								stats.thmload_ct += thmload;
							} else if (mtypeid === 'cfsd') {
								stats.thmload_cfsd += thmload;
							} else if (mtypeid === 'iscb') {
								var spinup = slot.getEffectiveAttrValue('spinup');
								stats.thmload_iscb += thmload / spinup;
								stats.spinup_iscb = max(stats.spinup_iscb, spinup);
								
								var shieldrnfps = (slot.getEffectiveAttrValue('duration') * slot.getEffectiveAttrValue('shieldrnfps'));
								var ammo = (slot.getEffectiveAttrValue('ammoclip') + slot.getEffectiveAttrValue('ammomax'));
								stats.shieldrnfps += shieldrnfps;
								stats.shieldrnfps_ammomax += shieldrnfps * ammo;
							} else if (mtypeid === 'isg' && !slot_isg) {
								slot_isg = slot;
							}
						}
					}
				}
			}
			
			// derived Totals stats
			stats.mass_hull = slot_hull.getEffectiveAttrValue('mass');
			stats.mass_unladen = stats.mass + stats.fuelcap;
			stats.mass_laden = stats.mass_unladen + stats.cargocap;
			
			// derived FSD stats
			var slot = this.getSlot('component', CORE_ABBR_SLOT.FD);
			var optmass = slot.getEffectiveAttrValue('optmass');
			var maxfuel = slot.getEffectiveAttrValue('maxfuel');
			var fuelmul = slot.getEffectiveAttrValue('fuelmul');
			var fuelpower = slot.getEffectiveAttrValue('fuelpower');
			stats._jump_laden    = getJumpDistance(            stats.mass + stats.fuelcap + stats.cargocap, min(stats.fuelcap, maxfuel), optmass, fuelmul, fuelpower, stats.jumpbst);
			stats._jump_unladen  = getJumpDistance(            stats.mass + stats.fuelcap                 , min(stats.fuelcap, maxfuel), optmass, fuelmul, fuelpower, stats.jumpbst);
			stats._range_laden   = getJumpRange(stats.fuelcap, stats.mass + stats.fuelcap + stats.cargocap, min(stats.fuelcap, maxfuel), optmass, fuelmul, fuelpower, stats.jumpbst);
			stats._range_unladen = getJumpRange(stats.fuelcap, stats.mass + stats.fuelcap                 , min(stats.fuelcap, maxfuel), optmass, fuelmul, fuelpower, stats.jumpbst);
			
			// derived Thruster stats
			var boostcost = slot_hull.getEffectiveAttrValue('boostcost');
			var topspd = slot_hull.getEffectiveAttrValue('topspd');
			var bstspd = slot_hull.getEffectiveAttrValue('bstspd');
			var slot = this.getSlot('component', CORE_ABBR_SLOT.PD);
			var engcap = slot.getEffectiveAttrValue('engcap');
			var slot = this.getSlot('component', CORE_ABBR_SLOT.TH);
			var minmass = slot.getEffectiveAttrValue('minmass');
			var optmass = slot.getEffectiveAttrValue('optmass');
			var maxmass = slot.getEffectiveAttrValue('maxmass');
			var minmulspd = slot.getEffectiveAttrValue('minmulspd');
			var optmulspd = slot.getEffectiveAttrValue('optmulspd');
			var maxmulspd = slot.getEffectiveAttrValue('maxmulspd');
			var effmulspd = (getMassCurveMultiplier(stats.mass + stats.fuelcap, minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd) / 100);
			stats._speed = (topspd * effmulspd);
			stats._boost = ((engcap > boostcost + BOOST_MARGIN) ? (bstspd * effmulspd) : 0);
			
			// derived Shield stats
			var mass_hull = slot_hull.getEffectiveAttrValue('mass');
			var shields = slot_hull.getEffectiveAttrValue('shields');
			var maxmass = (slot_isg ? slot_isg.getEffectiveAttrValue('maxmass') : 0);
			if (slot_isg && maxmass >= mass_hull) {
				var minmass = slot_isg.getEffectiveAttrValue('minmass');
				var optmass = slot_isg.getEffectiveAttrValue('optmass');
				var minmul = slot_isg.getEffectiveAttrValue('minmul');
				var optmul = slot_isg.getEffectiveAttrValue('optmul');
				var maxmul = slot_isg.getEffectiveAttrValue('maxmul');
				var kinres = slot_isg.getEffectiveAttrValue('kinres');
				var thmres = slot_isg.getEffectiveAttrValue('thmres');
				var expres = slot_isg.getEffectiveAttrValue('expres');
				var caures = slot_isg.getEffectiveAttrValue('caures');
				stats._shields = (
						shields
						* getEffectiveShieldBoostMultiplier(stats.shieldbst)
						* getMassCurveMultiplier(mass_hull, minmass, optmass, maxmass, minmul, optmul, maxmul) / 100
				) + stats.shieldrnf;
				// shield resistance is stacking-penalized EXCLUDING the generator!
				stats._skinres = getEffectiveDamageResistance(kinres, (1 - kinmod_usb) * 100);
				stats._sthmres = getEffectiveDamageResistance(thmres, (1 - thmmod_usb) * 100);
				stats._sexpres = getEffectiveDamageResistance(expres, (1 - expmod_usb) * 100);
				stats._scaures = getEffectiveDamageResistance(caures, (1 - caumod_usb) * 100);
			} else {
				stats._shields = 0;
			}
			
			// derived Armour stats
			var armour = slot_hull.getEffectiveAttrValue('armour');
			var slot = this.getSlot('component', CORE_ABBR_SLOT.BH);
			var kinres = slot.getEffectiveAttrValue('kinres');
			var thmres = slot.getEffectiveAttrValue('thmres');
			var expres = slot.getEffectiveAttrValue('expres');
			var caures = slot.getEffectiveAttrValue('caures');
			stats._armour = ((armour * (1 + stats.hullbst / 100)) + stats.hullrnf);
			// armour resistance is stacking-penalized INCLUDING the bulkheads!
			stats._akinres = getEffectiveDamageResistance(0, (1 - (1 - kinres / 100) * kinmod_ihrp) * 100);
			stats._athmres = getEffectiveDamageResistance(0, (1 - (1 - thmres / 100) * thmmod_ihrp) * 100);
			stats._aexpres = getEffectiveDamageResistance(0, (1 - (1 - expres / 100) * expmod_ihrp) * 100);
			stats._acaures = getEffectiveDamageResistance(0, (1 - (1 - caures / 100) * caumod_ihrp) * 100);
			
			// derived Weapon stats
			var powerdist_wep = this.getEffectivePowerDist('wep');
			var slot = this.getSlot('component', CORE_ABBR_SLOT.PD);
			var wepchg = slot.getEffectiveAttrValue('wepchg');
			var powerdistWepMul = pow(powerdist_wep / MAX_POWER_DIST, 1.1);
			stats.wepchg_sustain_cur = min(max(wepchg * powerdistWepMul / stats.distdraw_second, 0), 1);
			stats.wepchg_sustain_max = min(max(wepchg                   / stats.distdraw_second, 0), 1);
		}, // updateStats()
		
		
		getStat: function(stat) {
			if (!this.stats)
				this.updateStats();
			return this.stats[stat];
		}, // getStat()
		
		
		getHash: function() {
			if (!this.hash) {
				var crewbits = (((this.crewdist.sys & 0x3) << 4) | ((this.crewdist.eng & 0x3) << 2) | (this.crewdist.wep & 0x3));
				var distbits = (((this.powerdist.sys & 0xF) << 8) | ((this.powerdist.eng & 0xF) << 4) | (this.powerdist.wep & 0xF));
				var hash = (
					hashEncode(HASH_VERSION, 1)
					+ hashEncode(this.shipid & 0x3F, 1)
					+ hashEncode(this.getSlot('ship', 'hull').getDiscounts(), 1)
					+ hashEncode(crewbits, 1)
					+ hashEncode(distbits, 2)
					+ this.getSlot('ship', 'hatch').getHash()
				);
				for (var g = 0;  g < GROUPS.length;  g++) {
					var slotgroup = GROUPS[g];
					hash += ',';
					var gap = 0;
					var slot = null;
					for (var slotnum = 0;  slot = this.getSlot(slotgroup, slotnum);  slotnum++) {
						var slothash = slot.getHash();
						if (slothash) {
							hash += (gap ? hashEncode(199900+gap, 3) : '') + slothash;
							gap = 0;
						} else {
							gap++;
						}
					}
				}
				var namehash = hashEncodeT(this.name);
				var taghash = hashEncodeT(this.nametag);
				this.hash = hash + ((namehash || taghash) ? (',' + namehash + (taghash ? (',' + taghash) : '')) : '');
			}
			return this.hash;
		}, // getHash()
		
	}; // Build.prototype
	
	
	Build.getHashShipID = function(buildhash) {
		var version = hashDecode(buildhash.slice(0, 1));
		var idmap = Build.getHashVersionMap(version);
		var shipid = hashDecode(buildhash.slice(1, 1 + ((version >= 12) ? 1 : 2)));
		return (idmap.ship[shipid] || shipid);
	}; // getHashShipID()
	
	
	Build.fromHash = function(buildhash, errors) {
		// identify version and hash chunks
		var version = hashDecode(buildhash.slice(0, 1));
		var idmap = Build.getHashVersionMap(version);
		var chunks = buildhash.slice(1).split(',');
		var hashgroup = {
			ship      : chunks[0] || '',
			hardpoint : chunks[1],
			utility   : ((version >= 9) ? chunks[2] : ''),
			component : ((version >= 9) ? chunks[3] : chunks[2]),
			military  : ((version >= 10) ? chunks[4] : ''),
			internal  : ((version >= 10) ? chunks[5] : ((version >= 9) ? chunks[4] : chunks[3])),
			name      : ((version >= 12) ? chunks[6] : ''),
			nametag   : ((version >= 12) ? chunks[7] : ''),
		};
		
		// ship chunk
		var i = 0;
		var shipid = hashDecode(hashgroup.ship.slice(i, i += ((version >= 12) ? 1 : 2)));
		shipid = idmap.ship[shipid] || shipid;
		if (!eddb.ship[shipid]) {
			if (errors) errors.push('Invalid ship id #' + shipid);
			return null;
		}
		var build = new Build(shipid, false);
		var discounts = ((version >= 14) ? hashDecode(hashgroup.ship.slice(i, i += 1)) : 0);
		var crewbits = ((version >= 12) ? hashDecode(hashgroup.ship.slice(i, i += 1)) : 0);
		var distbits = ((version >= 12) ? hashDecode(hashgroup.ship.slice(i, i += 2)) : 0x444);
		if (!build.getSlot('ship', 'hull').setDiscounts(discounts)) {
			if (errors) errors.push('Invalid hull discounts: ' + discounts);
		}
		/* TODO? saving powerdist with build
		if (!build.setCrewDist((crewbits >> 4) & 0x3, (crewbits >> 2) & 0x3, crewbits & 0x3)) {
			if (errors) errors.push('Invalid crew assignments');
		}
		if (!build.setPowerDist((distbits >> 8) & 0xF, (distbits >> 4) & 0xF, distbits & 0xF)) {
			if (errors) errors.push('Invalid power distributor settings');
		}
		*/
		var slot = build.getSlot('ship', 'hatch');
		if (slot) {
			slot.setHash(hashgroup.ship.slice(i), version, errors);
		} else if (errors) errors.push('Invalid slot: ship hatch');
		
		for (var g = 0;  g < GROUPS.length;  g++) {
			var slotgroup = GROUPS[g];
			if (!hashgroup[slotgroup])
				continue;
			for (var i = 0, j = 0, n = 0, nU = 0;  i < hashgroup[slotgroup].length;  i = j) {
				var modid = hashDecode(hashgroup[slotgroup].slice(j, j += ((version >= 9 || slotgroup !== 'component') ? 3 : 2)));
				if (modid >= 199900) {
					// before version 9 utility was part of hardpoint
					if (version < 9 && slotgroup === 'hardpoint' && shipid == 42 && nU < 4) {
						nU += modid - 199900;
					} else {
						n += modid - 199900;
					}
				} else {
					var slotbits = ((version >= 8) ? hashDecode(hashgroup[slotgroup].slice(j, j += 1)) : 0);
					var discounted = (version < 14) ? 0 : (slotbits & 0x20);
					var modified = (slotbits & 0x10);
					if (discounted) {
						j += 1;
					}
					if (modified) {
						var modbits = ((version >= 9) ? hashDecode(hashgroup[slotgroup].slice(j, j += ((version >= 12) ? 3 : 2))) : 0);
						var bprolled = (version < 14) ? 0 : (modbits & 0x20000);
						if (!bprolled) {
							var mods = ((version >= 12) ? (modbits & 0x1F) : (modbits & 0x3F));
							j += mods * 4;
						}
					}
					var tgtslotgroup = slotgroup;
					var tgtslotnum = 0;
					// before version 9 utility was part of hardpoint
					if (version < 9 && slotgroup === 'hardpoint' && (eddb.module[idmap.utility[modid] || modid] || EMPTY_OBJ).class == 0) {
						tgtslotgroup = 'utility';
						tgtslotnum = nU;
						nU++;
					} else {
						var slotmap = (idmap.slotnum[shipid] || EMPTY_OBJ)[slotgroup];
						tgtslotnum = (slotmap ? slotmap[n] : n);
						n++;
					}
					slot = build.getSlot(tgtslotgroup, tgtslotnum);
					if (slot) {
						slot.setHash(hashgroup[slotgroup].slice(i, j), version, errors);
					} else if (errors) errors.push('Invalid slot: ' + tgtslotgroup + ' ' + (isNaN(tgtslotnum) ? tgtslotnum : (tgtslotnum+1)));
				}
			}
		}
		
		if (hashgroup.name)
			build.setName(hashDecodeT(hashgroup.name));
		if (hashgroup.nametag)
			build.setNameTag(hashDecodeT(hashgroup.nametag));
		return build;
	}; // Build.fromHash()
	
	
	Build.getHashVersionMap = function(version) {
		var idmap = cache.hashVersionMap[version];
		if (!idmap) {
			cache.hashVersionMap[version] = idmap = {
				slotnum   : {}, // slotnum[shipid][slotgroup][oldslotnum] = newslotnum
				ship      : {}, // ship[oldshipid] = newshipid
				hardpoint : {}, // hardpoint[oldmodid] = newmodid
				utility   : {}, // utility[oldmodid] = newmodid
				component : [ {}, {}, {}, {}, {}, {}, {}, {} ], // component[slotnum][oldmodid] = newmodid
				military  : {}, // military[oldmodid] = newmodid
				internal  : {}, // internal[oldmodid] = newmodid
				module    : {}, // module[oldmodid] = newmodid; for unified modid in version 9+
				blueprint : {},
				expeffect : {},
			};
			switch (version) {
			case 0:
			case 1:
				// rearranged some slots
				idmap.slotnum[31] = { hardpoint:[1,2,0] }; // Hauler hardpoint UUS -> SUU
				idmap.slotnum[41] = { hardpoint:[3,4,1,2,0] }; // Adder hardpoint UUSSM -> MSSUU
				idmap.slotnum[32] = { hardpoint:[2,3,4,0,1] }; // Type-6 hardpoint UUUSS -> SSUUU
				// accidentally used octal notation for some module IDs
				idmap.utility = {
				//	00090:  90,
					  560:1060,
				//	02090:2090,
				//	03090:3090,
				};
				idmap.internal = {
					// Auto Field-Maintenance Units
					  616:1150,   608:1140,   600:1130,   592:1120,   584:1110,
					  680:1250,   672:1240,   664:1230,   656:1220,   648:1210,
					  744:1350,   736:1340,   728:1330,   720:1320,   712:1310,
					  808:1450,   800:1440,   792:1430,   784:1420,   776:1410,
					  872:1550,   864:1540,   856:1530,   848:1520,   840:1510,
					  936:1650,   926:1640,   920:1630,   912:1620,   904:1610,
					 1000:1750,   992:1740,   984:1730,   976:1720,   968:1710,
				//	01850:1850, 01840:1840, 01830:1830, 01820:1820, 01810:1810,
					// Cargo Racks
					  104:150,    168:250,    232:350,    296:450,    360:550,    424:650,    488:750, // 00850:850,
					// Docking Computers
					 1640:3150,
					// Refineries
					 1128:2150,  1120:2140,  1112:2130,  1104:2120,  1096:2110,
					 1192:2250,  1184:2240,  1176:2230,  1169:2220,  1160:2210,
					 1256:2350,  1248:2340,  1240:2330,  1232:2320,  1224:2310,
					 1320:2450,  1312:2440,  1304:2430,  1296:2420,  1288:2410,
				};
			case 2:
				idmap.slotnum[33] = { hardpoint:[4,5,6,7,0,1,2,3] }; // Type-7 hardpoint UUUUSSSS -> SSSSUUUU
			case 3:
			case 4:
				if (version == 4) idmap.slotnum[51] = { internal:[2,3,4,5,6,7,8,9] }; // Orca internals erroneously reduced by 2 in v4, but not in prior versions
			case 5:
				idmap.ship[7] = 24; // Fer-de-Lance multipurpose -> combat
			case 6:
				idmap.hardpoint[22161] = 62171; // 1F/G Pulse Laser is actually 1G/G
			case 7:
				idmap.slotnum[4] = { hardpoint:[5,6,7,8,1,2,0,3,4] }; // Federal Dropship hardpoint UUUUMMLMM -> LMMMMUUUU
				// Bulkheads are now rating A-C instead of I
				idmap.component[CORE_ABBR_SLOT.BH] = {
					191:40131,
					192:40122,
					193:40113,
					194:40114,
					195:40115,
				};
			case 8:
				// in v9 we're unifying the mID space, requiring lots of changes to avoid conflicts
				
				// miscelanneous hardpoints -> 8xxxx
				idmap.hardpoint = {
					22161:62171, // 1F/G Pulse Laser from v6, just in case
					60190:80190, 61190:80191, 60290:80290, // Mine Launchers
					70140:81140, 70240:81240, 70144:81144, // Mining Lasers
					50120:82120, 50123:82123, 50220:82220, 50223:82223, 50224:82224, 50225:82225, // Missile Launchers
					24230:83230, 41320:83320, 41410:83410, 41324:83324, // Plasma Accelerators
					40140:84140, 40220:84220, 40224:84224, // Rail Guns
					51193:85193, 51293:85293, // Torpedo Pylons
				};
				
				// thermal and kinetic weapons -> 6xxxx - 7xxxx
				var mapBatch = [
					20150, 20151, 20162, 20240, 20241, 20252, 20330, 20331, 20332, 20410, 20411, 20154, // Beam Lasers
					21160, 21171, 21172, 21250, 21261, 21262, 21340, 21351, 21352, 21450, 21451, 21164, // Burst Lasers
					22160, 22171, 22172, 22250, 22261, 22262, 22350, 22361, 22362, 22410, 22411, 22254, // Pulse Lasers
					30140, 30151, 30162, 30240, 30241, 30252, 30330, 30331, 30342, 30420, 30421,        // Cannons
					31150, 31151, 31152, 31210, 31241, 31242, 31330, 31331, 31332,               31334, // Fragment Cannons
					32160, 32171, 32172, 32250, 32261, 32262, 32330, 32331,        32410, 32411,        // Multi-cannons
				];
				for (var i = 0;  i < mapBatch.length;  i++) {
					idmap.hardpoint[mapBatch[i]] = mapBatch[i] + 40000;
				}
				idmap.hardpoint[30144] = 72144; // Enforcer Cannon is not actually a Cannon but a Multi-cannon
				
				// Chaff, ECM, Heat Sink, Point Defence, Shield Boosters -> 50xxx - 54xxx
				var mapBatch = [90, 1060, 2090, 3090, 4050, 4040, 4030, 4020, 4010];
				for (var i = 0;  i < mapBatch.length;  i++) {
					idmap.utility[mapBatch[i]] = mapBatch[i] + 50000;
				}
				
				// Manifest, Wake, Kill Warrant Scanners -> 55xxx - 57xxx
				var mapBatch = [
					14050, 14040, 14030, 14020, 14010,
					15050, 15040, 15030, 15020, 15010,
					16050, 16040, 16030, 16020, 16010
				];
				for (var i = 0;  i < mapBatch.length;  i++) {
					idmap.utility[mapBatch[i]] = mapBatch[i] + 41000;
				}
				
				// all core components -> 40xxx - 47xxx
				var mapBatch = [
					131, 122, 113, 114, 115, // Bulkheads
					211, 311, // special Thrusters
					150, 140, 130, 120, 110,
					250, 240, 230, 220, 210,
					350, 340, 330, 320, 310,
					450, 440, 430, 420, 410,
					550, 540, 530, 520, 510,
					650, 640, 630, 620, 610,
					750, 740, 730, 720, 710,
					850, 840, 830, 820, 810
				];
				for (var slot = 0;  slot < eddb.group.component.length;  slot++) {
					for (var i = 0;  i < mapBatch.length;  i++) {
						idmap.component[slot][mapBatch[i]] = 40000 + (1000 * slot) + mapBatch[i];
					}
				}
				
				// Frame Shift Drive Interdictors, Hatch Breaker Limpet Controllers -> 25xxx - 26xxx
				var mapBatch = [
					40150, 40140, 40130, 40120, 40110,
					40250, 40240, 40230, 40220, 40210,
					40350, 40340, 40330, 40320, 40310,
					40450, 40440, 40430, 40420, 40410,
					41150, 41140, 41130, 41120, 41110,
					41350, 41340, 41330, 41320, 41310,
					41550, 41540, 41530, 41520, 41510,
					41750, 41740, 41730, 41720, 41710
				];
				for (var i = 0;  i < mapBatch.length;  i++) {
					idmap.internal[mapBatch[i]] = mapBatch[i] - 15000;
				}
				
				// optional Fuel Tanks -> 47xxx
				var mapBatch = [21130, 21230, 21330, 21430, 21530, 21630, 21730, 21830];
				for (var i = 0;  i < mapBatch.length;  i++) {
					idmap.internal[mapBatch[i]] = mapBatch[i] + 26000;
				}
			case 9:
			case 10:
				idmap.slotnum[34] = { internal:[0,2,3,4,5,6,7,8,9] }; // Type-9 gains size 8 internal
			case 11:
				var bp_misc = [null,null,null,'misc_sh4'];
				var bp_lmpt = [null,'misc_lw','misc_rf','misc_sh'];
				idmap.blueprint = {
					ucl   : ['ucl_ammo','misc_lw','misc_rf','misc_sh'],
					uhsl  : ['uhsl_ammo','misc_lw','misc_rf','misc_sh'],
					upd   : ['upd_ammo','misc_lw','misc_rf','misc_sh'],
					usb   : ['usb_br','usb_hd','usb_kr','usb_ra','usb_tr'],
					cls   : [null,'misc_lw4','misc_rf4','misc_sh4'],
					cs    : [null,'cs_lw',null,null,'cs_lr','cs_wa'],
					iafmu : bp_misc,
					iclc  : bp_lmpt,
					ifs   : bp_misc,
					iftlc : bp_lmpt,
					ihblc : bp_lmpt,
					iplc  : bp_lmpt,
					ir    : bp_misc,
					iss   : [null,null,null,null,'iss_lr','iss_wa','iss_fs'],
				};
				var bp_hdpt = ['wpn_ds','wpn_eff','wpn_foc','wpn_hc','wpn_lw','wpn_lr','wpn_oc','wpn_rf','wpn_sr','wpn_stu'];
				for (var mtypeid in eddb.group.hardpoint.mtypes) {
					if (!idmap.blueprint[mtypeid])
						idmap.blueprint[mtypeid] = bp_hdpt;
				}
				var bp_util = [null,'misc_lw','misc_rf','misc_sh','scan_lr','scan_wa','scan_fs'];
				for (var mtypeid in eddb.group.utility.mtypes) {
					if (!idmap.blueprint[mtypeid])
						idmap.blueprint[mtypeid] = bp_util;
				}
			case 12:
				// from edshipyard.net
				idmap.ship[60] = 13; // Alliance Challenger
				idmap.ship[63] = 14; // Krait Mk II
				idmap.module = {
					88221:88140, 88224:88143, 88256:88345, 88258:88146, 88259:88216, // Guardian Gauss Cannon, Guardian Plasma Charger, Guardian Shard Cannon
					24758:81141, 24749:81143, 24709:81225, 24699:81226, 24739:81127, 24729:81227, 24719:81228, // Abrasion Blaster, Seismic Charge Launcher, Sub-surface Displacement Missile
					82215:82313, // 3A/F Seeker Missile Rack
					40000:59050, 40001:59040, 40002:59030, 40003:59020, 40004:59010, // Pulse Wave Analyser
					16819:12180, 16818:12280, 16817:12380, 16816:12480, 16815:12580, // Guardian Frame Shift Driver Booster
					10662:32151, 10661:32141, 10660:32251, 10659:32241, 10658:32351, 10657:32341, 10656:32451, 10655:32441, 10654:32551, 10653:32541, // Guardian Shield Reinforcement Package
					88350: 8151, 88349: 8141, 88348: 8251, 88347: 8241, 88346: 8351, 88345: 8341, 88344: 8451, 88343: 8441, 88342: 8551, 88341: 8541, // Guardian Module Reinforcement Package
				};
				// from edshipyard.com/new
				idmap.slotnum[43] = { hardpoint:[2,3,0,1] }; // Diamondback Scout hardpoint SSMM -> MMSS
				idmap.slotnum[35] = { hardpoint:[2,3,0,1] }; // Keelback hardpoint SSMM -> MMSS
				idmap.slotnum[45] = { hardpoint:[2,3,0,1] }; // Asp Scout hardpoint SSMM -> MMSS
				idmap.slotnum[42] = { hardpoint:[2,3,4,5,0,1] }; // Asp Explorer hardpoint SSSSMM -> MMSSSS
				idmap.slotnum[36] = { hardpoint:[4,5,6,0,1,2,3,7,8] }; // Type-10 hardpoint MMMLLLLSS -> LLLLMMMSS
				idmap.slotnum[62] = { hardpoint:[3,4,5,6,1,2,0] }; // Imperial Cutter hardpoint MMMMLLH -> HLLMMMM
				idmap.module[10130] = -1; // Advanced Discovery Scanner
				idmap.module[10140] = -1; // Intermediate Discovery Scanner
				idmap.module[10150] = -1; // Basic Discovery Scanner
				if (!idmap.blueprint['iss'])
					idmap.blueprint['iss'] = [];
				idmap.blueprint['iss'][0] = 'iss_er';
				idmap.blueprint['iss'][1] = 'iss_er';
				idmap.blueprint['iss'][2] = 'iss_er';
			case 13:
			case 14: // HASH_VERSION
			default:
			}
		}
		return idmap;
	}; // Build.getHashVersionMap()
	
	
	/*
	* MODULES & ATTRIBUTES
	*/
	
	
	var getAttrModifier = function(attr, base, value) {
		var attribute = eddb.attribute[attr];
		if (!attribute || isNaN(value) || value == base)
			return undefined;
		if (attribute.modset)
			return value;
		if (attribute.modadd)
			return value - base;
		if (attribute.modmod)
			return (((1 + (value / attribute.modmod)) / (1 + (base / attribute.modmod))) - 1);
		return ((value / base) - 1);
	}; // getAttrModifier()
	
	
	var getAttrModifierDirection = function(attr, modifier) {
		if (!modifier || isNaN(modifier))
			return 0;
		var attribute = eddb.attribute[attr];
		return (modifier * (attribute.modmod || 1) * (attribute.bad ? -1 : 1));
	}; // getAttrModifierDirection()
	
	
	var getAttrModifierSum = function(attr, modifier1, modifier2) {
		if (!modifier1 || !modifier2)
			return (modifier2 || modifier1);
		var attribute = eddb.attribute[attr];
		if (attribute.modset)
			return modifier2;
		if (attribute.modadd)
			return modifier1 + modifier2;
		// modmod and standard
		return ((1 + modifier1) * (1 + modifier2) - 1);
	}; // getAttrModifierSum()
	
	
	var getAttrModifierDifference = function(attr, modifier1, modifier2) {
		var attribute = eddb.attribute[attr];
		if (attribute.modset || !modifier2)
			return modifier1;
		if (attribute.modadd)
			return (modifier1 || 0) - modifier2;
		// modmod and standard
		return (((1 + (modifier1 || 0)) / (1 + modifier2)) - 1);
	}; // getAttrModifierDifference()
	
	
	var getModuleLabel = function(module, abbrev, icons) {
		var label = '' + module.class + module.rating;
		if (module.mount || module.missile || module.cabincls) {
			label += '/' +
				(module.mount   ? (icons ? (HTML_ICON_MOUNT[  module.mount  ] || HTML_ICON['unknown']) : module.mount  ) : '') +
				(module.missile ? (icons ? (HTML_ICON_MISSILE[module.missile] || HTML_ICON['unknown']) : module.missile) : '') +
				(module.cabincls || '')
			;
		}
		if (module.tag && icons)
			label += (HTML_ICON_TAG[module.tag] || HTML_ICON['unknown']);
		var name = module.name;
		if (abbrev) {
			name = ((eddb.mtype[module.mtype] || EMPTY_OBJ).modulenames || EMPTY_OBJ)[name] || name;
			name = (typeof name === 'string') ? name : '';
		}
		return label + ((label && name) ? ' ' : '') + name;
	}; // getModuleLabel()
	
	
	var getModuleAttrs = function(module) {
		var attrflag = {};
		for (var attr in module) {
			if (eddb.attribute[attr])
				attrflag[attr] = 1;
		}
		var mtype = eddb.mtype[module.mtype];
		if (mtype) {
			var modifiable = (mtype.modifiable || EMPTY_ARR);
			for (var a = 0;  a < modifiable.length;  a++) {
				if (eddb.attribute[modifiable[a]])
					attrflag[modifiable[a]] = 1;
			}
		}
		if (attrflag.damage) {
			attrflag.dps = 1;
			if (attrflag.rldtime)
				attrflag.sdps = 1;
		}
		if (attrflag.bstrof || attrflag.bstsize || attrflag.bstint) {
			attrflag.rof = 1;
			if (attrflag.rldtime)
				attrflag.srof = 1;
		}
		var attrs = Object.keys(attrflag);
		attrs.sort(sortAttributes);
		return attrs;
	}; // getModuleAttrs()
	
	
	var getModuleAttrModificationIndex = function(module, attr) {
		var attribute = eddb.attribute[attr];
		if (!module || !attribute)
			return -1;
		var modifiable = (eddb.mtype[module.mtype] || EMPTY_OBJ).modifiable;
		var value = ((attr in module) ? module[attr] : attribute.default);
		if (!modifiable || isNaN(value) || (value == 0 && !attribute.modset && !attribute.modadd && !attribute.modmod))
			return -1;
		return modifiable.indexOf(attr);
	}; // getModuleAttrModificationIndex()
	
	
	var isModuleAttrModifiable = function(module, attr) {
		return (getModuleAttrModificationIndex(module, attr) >= 0);
	}; // isModuleAttrModifiable()
	
	
	var getModuleAttrValue = function(module, attr, modifier) {
		var attribute = eddb.attribute[attr];
		if (!module)
			return undefined;
		
		// fetch or calculate the base value
		var value = module[attr];
		switch (attr) {
		case 'rof':
			var bstsize = getModuleAttrValue(module, 'bstsize');
			var bstrof = getModuleAttrValue(module, 'bstrof');
			var bstint = getModuleAttrValue(module, 'bstint');
			value = bstsize / ((bstsize - 1) / bstrof + bstint);
			break;
			
		case 'srof':
			var ammoclip = getModuleAttrValue(module, 'ammoclip');
			if (ammoclip) {
				var bstsize = getModuleAttrValue(module, 'bstsize');
				var bstrof = getModuleAttrValue(module, 'bstrof');
				var bstint = getModuleAttrValue(module, 'bstint');
				var rldtime = getModuleAttrValue(module, 'rldtime');
				value = ammoclip / ((ammoclip / bstrof) + (ceil(ammoclip / bstsize) * (bstint - (1 / bstrof))) - bstint + rldtime);
			} else {
				value = getModuleAttrValue(module, 'rof');
			}
			break;
			
		case 'dps':
		case 'sdps':
			var damage = getModuleAttrValue(module, 'damage');
			var rof = getModuleAttrValue(module, (attr === 'dps' ? 'rof' : 'srof'));
			var rounds = getModuleAttrValue(module, 'rounds');
			value = (damage * (isFinite(rof) ? rof : 1) * rounds);
			break;
			
		case 'eps':
		case 'seps':
			var distdraw = getModuleAttrValue(module, 'distdraw');
			var rof = getModuleAttrValue(module, (attr === 'eps' ? 'rof' : 'srof'));
			value = (distdraw * (isFinite(rof) ? rof : 1));
			break;
			
		case 'hps':
		case 'shps':
			var thmload = getModuleAttrValue(module, 'thmload');
			var rof = getModuleAttrValue(module, (attr === 'hps' ? 'rof' : 'srof'));
			value = (thmload * (isFinite(rof) ? rof : 1));
			break;
			
		case 'minmul':
			if (('minmulspd' in module) || ('minmulacc' in module) || ('minmulrot' in module)) {
				value = ((getModuleAttrValue(module, 'minmulspd') + getModuleAttrValue(module, 'minmulacc') + getModuleAttrValue(module, 'minmulrot')) / 3.0);
			}
			break;
			
		case 'optmul':
			if (('optmulspd' in module) || ('optmulacc' in module) || ('optmulrot' in module)) {
				value = ((getModuleAttrValue(module, 'optmulspd') + getModuleAttrValue(module, 'optmulacc') + getModuleAttrValue(module, 'optmulrot')) / 3.0);
			}
			break;
			
		case 'maxmul':
			if (('maxmulspd' in module) || ('maxmulacc' in module) || ('maxmulrot' in module)) {
				value = ((getModuleAttrValue(module, 'maxmulspd') + getModuleAttrValue(module, 'maxmulacc') + getModuleAttrValue(module, 'maxmulrot')) / 3.0);
			}
			break;
		}
		
		if (attribute) {
			// fall back on attribute default value
			if (value === undefined)
				value = ((isNaN(attribute.default) && !isNaN(attribute.scale)) ? getModuleAttrValue(module, attribute.default) : attribute.default);
			
			// apply modifier
			if (modifier && !isNaN(value) && (value || attribute.modset || attribute.modadd || attribute.modmod)) {
				if (attribute.modset) {
					value = modifier;
				} else if (attribute.modadd) {
					value = value + modifier;
				} else if (attribute.modmod) {
					value = ((1 + (value / attribute.modmod)) * (1 + modifier) - 1) * attribute.modmod;
				} else {
					value = value * (1 + modifier);
				}
				if (attribute.step)
					value = round(value / attribute.step) * attribute.step;
				if (attribute.min !== undefined)
					value = max(value, attribute.min);
				if (attribute.max !== undefined)
					value = min(value, attribute.max);
			}
		}
		
		return value;
	}; // getModuleAttrValue()
	
	
	var getModuleAttrValueText = function(module, attr, value) {
		var attribute = eddb.attribute[attr];
		if (!module || !attribute || isNaN(value) || !isFinite(value))
			return value;
		if (attribute.step) {
			var step = attribute.step;
		} else if (attribute.modset || attribute.modadd) {
			var step = 1 / (1 << 14);
		} else if (attribute.modmod) {
			var step = abs(attribute.modmod) / (1 << 14);
		} else {
			var step = (getModuleAttrValue(module, attr) || 1) / (1 << 14);
		}
		var decimals = -ceil(log(step) / LN10 - 0.000001);
		if (decimals > 0) {
			var text = value.toFixed(decimals).replace(/(\.[0-9]*?[1-9])0+$/, '$1').replace(/\.0*$/, '');
		} else {
			var step = pow(10, -decimals);
			var text = (((value / step + 0.5) | 0) * step).toFixed(0);
		}
		return text;
	}; // getModuleAttrValueText()
	
	
	var getModuleAttrModifier = function(module, attr, value) {
		var attribute = eddb.attribute[attr];
		var base = getModuleAttrValue(module, attr);
		if (!attribute || isNaN(value) || value == base)
			return undefined;
		if (attribute.modset)
			return getModuleAttrValue(module, attr, value);
		if (attribute.modadd)
			return getModuleAttrValue(module, attr, value - base) - base;
		if (attribute.modmod) {
			value = getModuleAttrValue(module, attr, ((1 + (value / attribute.modmod)) / (1 + (base / attribute.modmod))) - 1);
			return (((1 + (value / attribute.modmod)) / (1 + (base / attribute.modmod))) - 1);
		}
		value = getModuleAttrValue(module, attr, (value / base) - 1);
		return ((value / base) - 1);
	}; // getModuleAttrModifier()
	
	
	var getModuleAttrModifierText = function(module, attr, modifier) {
		var text = '';
		var base = getModuleAttrValue(module, attr);
		var value = getModuleAttrValue(module, attr, modifier);
		if (modifier && !isNaN(base) && !isNaN(value)) {
			text = ((value > base) ? '+' : '');
			var attribute = eddb.attribute[attr];
			if (attribute.modset || attribute.modadd) {
				text += (value - base).toFixed((attribute.step >= 1) ? 0 : 2);
			} else if (attribute.modmod || attribute.unit === '%') {
				text += (value - base).toFixed(1) + '%';
			} else {
				text += (((value / base) - 1) * 100).toFixed(1) + '%';
			}
		}
		return text;
	}; // getModuleAttrModifierText()
	
	
	var parseModuleAttrModifierText = function(module, attr, text) {
		var attribute = eddb.attribute[attr];
		text = text.trim();
		var textvalue = parseFloat(text);
		if (!attribute || isNaN(textvalue))
			return undefined;
		var base = getModuleAttrValue(module, attr);
		if (text.slice(-1) === '%' && (attribute.unit !== '%' || textvalue[0] === '+' || textvalue[0] === '-')) {
			var value = base * (1 + textvalue / 100);
		} else {
			var value = base + textvalue;
		}
		return getModuleAttrModifier(module, attr, value);
	}; // parseModuleAttrModifierText()
	
	
	/*
	* DATABASE CACHE INIT
	*/
	
	
	var sortNumbersDesc = function(num1, num2) {
		return num2 - num1;
	}; // sortNumbersDesc()
	
	
	var sortAttributes = function(attr1, attr2) {
		var a1 = eddb.attribute[attr1];
		var a2 = eddb.attribute[attr2];
		var v1 = a1.order;
		var v2 = a2.order;
		if (v1 != v2) return v1 - v2;
		v1 = a1.name;
		v2 = a2.name;
		if (v1 != v2) return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
		v1 = attr1;
		v2 = attr2;
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortAttributes()
	
	
	var sortShipIDs = function(shipid1, shipid2) {
		var v1 = eddb.ship[shipid1].name;
		var v2 = eddb.ship[shipid2].name;
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortShipIDs()
	
	
	var sortMtypes = function(mtype1, mtype2) {
		var v1 = (eddb.mtype[mtype1].sortname || eddb.mtype[mtype1].name);
		var v2 = (eddb.mtype[mtype2].sortname || eddb.mtype[mtype2].name);
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortMtypes()
	
	
	var sortModules = function(modid1, modid2) {
		var m1 = eddb.module[modid1];
		var m2 = eddb.module[modid2];
		// by class (size)
		var v1 = 0 + (m1.class || 0);
		var v2 = 0 + (m2.class || 0);
		if (v1 != v2) return v1 - v2;
		// by uniqueness
		v1 = eddb.mtype[m1.mtype].modulenames[m1.name];
		v1 = (v1 ? ((typeof v1 !== 'string') ? 0 : 1) : 2);
		v2 = eddb.mtype[m2.mtype].modulenames[m2.name];
		v2 = (v2 ? ((typeof v2 !== 'string') ? 0 : 1) : 2);
		if (v1 != v2) return v1 - v2;
		// if non-unique, ...
		if (v1 < 2) {
			// by missile type (D-S)
			v1 = 0 + (m1.missile || ' ').charCodeAt(0);
			v2 = 0 + (m2.missile || ' ').charCodeAt(0);
			if (v1 != v2) return v1 - v2;
			// by passenger cabin class (E-B-F-L)
			v1 = 0 + (((m1.cabincls == 'E') ? 'A' : m1.cabincls) || ' ').charCodeAt(0);
			v2 = 0 + (((m2.cabincls == 'E') ? 'A' : m2.cabincls) || ' ').charCodeAt(0);
			if (v1 != v2) return v1 - v2;
		}
		// if experimental, by name
		if (m1.mtype === 'hex' || m1.mtype === 'uex') {
			v1 = m1.name;
			v2 = m2.name;
			if (v1 != v2) return ((v1 < v2) ? -1 : (v1 > v2) ? 1 : 0);
		}
		// by tag
		v1 = 0 - (m1.tag || '~').charCodeAt(0);
		v2 = 0 - (m2.tag || '~').charCodeAt(0);
		if (v1 != v2) return v1 - v2;
		// by mount type (F-G-T)
		v1 = 0 + (m1.mount || ' ').charCodeAt(0);
		v2 = 0 + (m2.mount || ' ').charCodeAt(0);
		if (v1 != v2) return v1 - v2;
		// by rating (A-B-C-D-E-F-G-H-I)
		v1 = 0 - (m1.rating || ' ').charCodeAt(0);
		v2 = 0 - (m2.rating || ' ').charCodeAt(0);
		if (v1 != v2) return v1 - v2;
		// by name
		v1 = m1.name;
		v2 = m2.name;
		if (v1 != v2) return ((v1 < v2) ? -1 : (v1 > v2) ? 1 : 0);
		// by cost
		v1 = 0 - (m1.cost || 0);
		v2 = 0 - (m2.cost || 0);
		if (v1 != v2) return v1 - v2;
		
		return 0;
	}; // sortModules()
	
	
	var sortBlueprints = function(bpid1, bpid2) {
		var v1 = (eddb.blueprint[bpid1] || EMPTY_OBJ).name;
		var v2 = (eddb.blueprint[bpid2] || EMPTY_OBJ).name;
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortBlueprints()
	
	
	var sortExpeffects = function(expid1, expid2) {
		var v1 = (eddb.expeffect[expid1] || EMPTY_OBJ).name;
		var v2 = (eddb.expeffect[expid2] || EMPTY_OBJ).name;
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortExpeffects()
	
	
	var sortDiscounts = function(db1, db2) {
		return cache.discountMod[db1] - cache.discountMod[db2];
	}; // sortDiscounts()
	
	
	var getClosestDiscount = function(mod) {
		var a = cache.discounts;
		var lo = 0;
		var hi = a.length - 1;
		if (mod < cache.discountMod[a[lo]]) return a[lo];
		if (mod > cache.discountMod[a[hi]]) return a[hi];
		while ((hi - lo) > 1) {
			var md = (lo + hi) >> 1;
			var val = cache.discountMod[a[md]];
			if (val < mod) {
				lo = md + 1;
			} else if (val > mod) {
				hi = md - 1;
			} else {
				return a[md];
			}
		}
		return (((mod - cache.discountMod[a[lo]]) < (cache.discountMod[a[hi]] - mod)) ? a[lo] : a[hi]);
	}; // getClosestDiscount()
	
	
	var initCache = function() {
		// identify and sort ships
		cache.ships = Object.keys(eddb.ship);
		cache.ships.sort(sortShipIDs);
		
		// initialize ship-specific module attributes and stock ship builds and hashes
		cache.shipModules = {};
		cache.shipBuild = {};
		cache.shipHash = {};
		for (var shipid in eddb.ship) {
			var ship = eddb.ship[shipid];
			cache.shipModules[shipid] = {};
			for (var modid in (ship.module || EMPTY_OBJ)) {
				cache.shipModules[shipid][modid] = clone(clone({}, eddb.module[modid]), ship.module[modid]);
			}
			var build = new Build(shipid, true);
			cache.shipBuild[shipid] = build;
			cache.shipHash[shipid] = build.getHash();
		}
		
		// identify and sort mtypes for each group
		cache.groupMtypes = {};
		cache.mtypeModules = {};
		for (var g = 0;  g < GROUPS.length;  g++) {
			var group = GROUPS[g];
			cache.groupMtypes[group] = [];
			if (group === 'component') {
				for (var s = 0;  s < eddb.group.component.length;  s++) {
					for (var mtype in eddb.group.component[s].mtypes) {
						// display fuel tanks under internals so they appear in the right place in both filters
						if (mtype === 'cft') continue;
						cache.groupMtypes[group].push(mtype);
						cache.mtypeModules[mtype] = [];
					}
				}
			} else if (group === 'military') {
				// display all military under internals
			} else {
				for (var mtype in eddb.group[group].mtypes) {
					cache.groupMtypes[group].push(mtype);
					cache.mtypeModules[mtype] = [];
				}
				cache.groupMtypes[group].sort(sortMtypes);
			}
		}
		
		// initialize stock module hashes and sort mtype modules
		cache.moduleHash = {};
		for (var modid in eddb.module) {
			cache.moduleHash[modid] = Slot.getModuleIDStoredHash(modid);
			var mtype = eddb.module[modid].mtype;
			if (cache.mtypeModules[mtype]) {
				cache.mtypeModules[mtype].push(modid);
			}
		}
		cache.mtypeSizeGaps = {};
		for (var mtype in cache.mtypeModules) {
			cache.mtypeModules[mtype].sort(sortModules);
			var classes = {};
			for (var m = 0;  m < cache.mtypeModules[mtype].length;  m++) {
				classes[eddb.module[cache.mtypeModules[mtype][m]].class] = 1;
			}
			for (var c = 0;  c <= MAX_SLOT_CLASS;  c++) {
				for (var u = c + 1;  u <= MAX_SLOT_CLASS && classes[c] && !classes[u];  u++) {
					if (!cache.mtypeSizeGaps[mtype])
						cache.mtypeSizeGaps[mtype] = {};
					if (!cache.mtypeSizeGaps[mtype][c])
						cache.mtypeSizeGaps[mtype][c] = [];
					cache.mtypeSizeGaps[mtype][c].push(u);
				}
			}
		}
		
		// sort mtype blueprints and expeffects
		cache.mtypeBlueprints = {};
		cache.mtypeExpeffects = {};
		for (var mtype in eddb.mtype) {
			if (eddb.mtype[mtype].blueprints) {
				cache.mtypeBlueprints[mtype] = eddb.mtype[mtype].blueprints.slice(0);
				cache.mtypeBlueprints[mtype].sort(sortBlueprints);
			}
			if (eddb.mtype[mtype].expeffects) {
				cache.mtypeExpeffects[mtype] = eddb.mtype[mtype].expeffects.slice(0);
				cache.mtypeExpeffects[mtype].sort(sortExpeffects);
			}
		}
		
		// generate and sort discount bits
		for (var db = 0;  db < 0x40;  db++) {
			var mod = 1.0, m = 1, i = DISCOUNTS.length;
			while (i-- > 0) {
				mod *= (db & m) ? (1.0 - DISCOUNTS[i] / 100.0) : 1.0;
				m <<= 1;
			}
			cache.discountMod[db] = mod;
			cache.discounts.push(db);
		}
		cache.discountMod[0x3F] = 0;
		cache.discounts.sort(sortDiscounts);
	}; // initCache()
	
	
	/*
	* PAGE UI
	*/
	
	
	var updateUIOptions = function() {
		var classes = [];
		for (var opt in current.option) {
			if (current.option[opt] = document.forms.options.elements[opt].checked)
				classes.push(opt);
		}
		document.body.className = classes.join(' ');
		updateUIDetailsModifications();
	}; // updateUIOptions()
	
	
	var setUIPageTab = function(tab) {
		current.page = tab;
		document.forms.header.elements.tab.value = tab;
		document.getElementById('page_body').className = tab;
	}; // setUIPageTab()
	
	
	var showUIPopup = function(element, trigger, refocus, sticky, onOkay, onCancel) {
		if (trigger && current.popup.trigger === trigger) {
			return hideUIPopup();
		} else if (current.popup.element) {
			current.popup.element.style.display = 'none';
		} else {
			document.addEventListener('click', onDocumentClickFocus, true);
			document.addEventListener('focus', onDocumentClickFocus, true);
		}
		element.style.display = 'block';
		current.popup.element = element;
		current.popup.trigger = trigger;
		current.popup.refocus = refocus;
		current.popup.sticky = sticky;
		current.popup.onOkay = onOkay;
		current.popup.onCancel = onCancel;
		return true;
	}; // showUIPopup()
	
	
	var showUITextPopup = function(html, text, trigger, sticky, onOkay, onCancel) {
		var popup = document.getElementById('popup_modal');
		var labelarea = document.getElementById('popup_desc');
		var textarea = document.forms.popup.elements.textbox;
		var okay = document.forms.popup.elements.okay;
		var cancel = document.forms.popup.elements.cancel;
		labelarea.innerHTML = html || '';
		textarea.removeAttribute('style');
		okay.style.display = (onOkay ? '' : 'none');
		cancel.style.display = (onCancel ? '' : 'none');
		if (text) {
			var lines = text.split('\n');
			var height = lines.length;
			var width = 0;
			while (lines.length > 0)
				width = max(width, lines.pop().length);
			textarea.cols = min(width + 5, 100);
			textarea.rows = min(height + 1, 30);
			textarea.value = text;
			textarea.style.display = '';
		} else {
			textarea.value = '';
			textarea.style.display = 'none';
		}
		var refocus = (text ? textarea : (sticky ? ((onOkay && okay) || (onCancel && cancel)) : null));
		if (!showUIPopup(popup, trigger, refocus, sticky, onOkay, onCancel))
			return false;
		if (text) {
			textarea.focus();
			textarea.select();
		} else if (onOkay) {
			okay.focus();
		} else if (onCancel) {
			cancel.focus();
		}
		return true;
	}; // showUITextPopup()
	
	
	var hideUIPopup = function() {
		if (!current.popup.element)
			return false;
		document.removeEventListener('click', onDocumentClickFocus, true);
		document.removeEventListener('focus', onDocumentClickFocus, true);
		current.popup.element.style.display = 'none';
		current.popup.element = null;
		current.popup.trigger = null;
		current.popup.refocus = null;
		current.popup.sticky = null;
		current.popup.onOkay = null;
		current.popup.onCancel = null;
		return true;
	}; // hideUIPopup()
	
	
	/*
	* SHIPYARD UI
	*/
	
	
	var formatShipyardSlots = function(build, slotgroup, map) {
		var sizes = eddb.ship[build.getShipID()].slots[slotgroup].slice(0);
		sizes.sort(sortNumbersDesc);
		if (map) {
			var i = sizes.length;
			while (i-- > 0)
				sizes[i] = (map[sizes[i] || 0] || '?');
		}
		return sizes.join(' ');
	}; // formatShipyardSlots()
	
	
	var UI_SHIPYARD_COL = {
		label     : { header:'Build', css:'text', nochange:1, render:function(build) { return build.getName(); } },
		name_ship : { header:'Ship',  css:'text', nochange:1, shipattr:'name' },
		cost      : { header:'Price', css:'tar', attr:'cost', scale:0, buildstat:'cost' },
		szcls     : { header:'Sz',    css:'tac', render:function(build) { return '?SML'[(eddb.ship[build.getShipID()] || EMPTY_OBJ).class || 0]; } },
		crew      : { header:'Crw',   css:'tar', attr:'crew', shipattr:'crew' },
		masslock  : { header:'MLF',   css:'tar', attr:'masslock', shipattr:'masslock' },
		mass_hull : { header:'Hull',  colgroup:'Mass', css:'tar', attr:'mass', scale:0, buildstat:'mass_hull' },
		mass_unl  : { header:'Unl',   colgroup:'Mass', css:'tar', attr:'mass', scale:0, buildstat:'mass_unladen' },
		mass_ldn  : { header:'Ldn',   colgroup:'Mass', css:'tar', attr:'mass', scale:0, buildstat:'mass_laden' },
		jump_unl  : { header:'Unl',   colgroup:'Jump', css:'tar', scale:1, buildstat:'_jump_unladen' },
		jump_ldn  : { header:'Ldn',   colgroup:'Jump', css:'tar', scale:1, buildstat:'_jump_laden' },
		range_unl : { header:'Unl',   colgroup:'Range', css:'tar', scale:1, buildstat:'_range_unladen' },
		range_ldn : { header:'Ldn',   colgroup:'Range', css:'tar', scale:1, buildstat:'_range_laden' },
		topspd    : { header:'Spd',   colgroup:' ', css:'tar', attr:'topspd', buildstat:'_speed' },
		bstspd    : { header:'Bst',   colgroup:' ', css:'tar', attr:'bstspd', buildstat:'_boost' },
		shields   : { header:'Shd',   colgroup:'  ', css:'tar', attr:'shields', buildstat:'_shields' },
		armour    : { header:'Arm',   colgroup:'  ', css:'tar', attr:'armour', buildstat:'_armour' },
		hardness  : { header:'Hrd',   colgroup:'  ', css:'tar', attr:'hardness', shipattr:'hardness' },
		fuelcap   : { header:'Fuel',  colgroup:' ', css:'tar', attr:'fuelcap', scale:0, buildstat:'fuelcap' },
		cargocap  : { header:'Crgo',  colgroup:' ', css:'tar', attr:'cargocap', buildstat:'cargocap' },
		cabincap  : { header:'Psgr',  colgroup:' ', css:'tar', attr:'cabincap', buildstat:'cabincap' },
		slots_hardpoint : { header:'Hardpoints',      colgroup:'Module Slots', css:'tal', render:function(build) { return formatShipyardSlots(build, 'hardpoint', 'USMLH'); } },
		slots_utility   : { header:'Utl',             colgroup:'Module Slots ', css:'tac', render:function(build) { return eddb.ship[build.getShipID()].slots.utility.length; } },
		slots_core_0    : { header:CORE_SLOT_ABBR[0], colgroup:'Module Slots', css:'tac', render:function(build) { return eddb.ship[build.getShipID()].slots.component[0]; } },
		slots_core_1    : { header:CORE_SLOT_ABBR[1], colgroup:'Module Slots', css:'tac', render:function(build) { return eddb.ship[build.getShipID()].slots.component[1]; } },
		slots_core_2    : { header:CORE_SLOT_ABBR[2], colgroup:'Module Slots', css:'tac', render:function(build) { return eddb.ship[build.getShipID()].slots.component[2]; } },
		slots_core_3    : { header:CORE_SLOT_ABBR[3], colgroup:'Module Slots', css:'tac', render:function(build) { return eddb.ship[build.getShipID()].slots.component[3]; } },
		slots_core_4    : { header:CORE_SLOT_ABBR[4], colgroup:'Module Slots', css:'tac', render:function(build) { return eddb.ship[build.getShipID()].slots.component[4]; } },
		slots_core_5    : { header:CORE_SLOT_ABBR[5], colgroup:'Module Slots', css:'tac', render:function(build) { return eddb.ship[build.getShipID()].slots.component[5]; } },
		slots_core_6    : { header:CORE_SLOT_ABBR[6], colgroup:'Module Slots', css:'tac', render:function(build) { return eddb.ship[build.getShipID()].slots.component[6]; } },
		slots_core_7    : { header:CORE_SLOT_ABBR[7], colgroup:'Module Slots', css:'tac', render:function(build) { return eddb.ship[build.getShipID()].slots.component[7]; } },
		slots_military  : { header:'Mil',             colgroup:'Module Slots ', css:'tal', render:function(build) { return formatShipyardSlots(build, 'military');} },
		slots_internal  : { header:'Opt Internal',    colgroup:'Module Slots', css:'tal', render:function(build) { return formatShipyardSlots(build, 'internal');} },
		dps       : { header:'DPS',   colgroup:'Weapons', css:'tar', attr:'dps', scale:1, buildstat:'dps' },
		dps_abs   : { header:'Abs',   colgroup:'Weapons', css:'tar', render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_abs') / dps, 0) : ''); } },
		dps_kin   : { header:'Kin',   colgroup:'Weapons', css:'tar', render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_kin') / dps, 0) : ''); } },
		dps_thm   : { header:'Thm',   colgroup:'Weapons', css:'tar', render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_thm') / dps, 0) : ''); } },
		dps_exp   : { header:'Exp',   colgroup:'Weapons', css:'tar', render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_exp') / dps, 0) : ''); } },
		dps_axe   : { header:'AXe',   colgroup:'Weapons', css:'tar', render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_axe') / dps, 0) : ''); } },
		dps_cau   : { header:'Cau',   colgroup:'Weapons', css:'tar', render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_cau') / dps, 0) : ''); } },
	}; // UI_SHIPYARD_COL{}
	
	var UI_SHIPYARD_SHIPS_COLS = [
		'name_ship','cost','szcls','crew','masslock',
		'mass_unl','jump_unl',
		'topspd','bstspd','shields','armour','hardness','fuelcap','cargocap','cabincap',
		'slots_hardpoint','slots_utility',
		'slots_core_1','slots_core_2','slots_core_3','slots_core_4','slots_core_5','slots_core_6','slots_core_7',
		'slots_military','slots_internal',
	]; // UI_SHIPYARD_SHIPS_COLS[]
	
	var UI_SHIPYARD_STOREDBUILD_COLS = [
		'label','_BUTTONS_','name_ship','cost',
		'mass_unl','mass_ldn','jump_unl','jump_ldn','range_unl','range_ldn',
		'topspd','bstspd','shields','armour','fuelcap','cargocap','cabincap',
		'dps','dps_abs','dps_kin','dps_thm','dps_exp','dps_axe'
	]; // UI_SHIPYARD_STOREDBUILD_COLS[]
	
	
	var initUIShipyardShips = function() {
		var div = document.createElement('div');
		div.id = 'shipyard_ships_container';
		
		var table = document.createElement('table');
		table.id = 'shipyard_ships_table';
		var thead = createUIShipyardHeader(UI_SHIPYARD_SHIPS_COLS);
		table.appendChild(thead);
		var tbody = document.createElement('tbody');
		for (var s = 0;  s < cache.ships.length;  s++) {
			var shipid = cache.ships[s];
			var tr = createUIShipyardRow(UI_SHIPYARD_SHIPS_COLS);
			tr.id = 'shipyard_ship_' + shipid;
			tr.cells[0].innerHTML = '<button name="shipyard_ship" value="' + shipid + '" class="label">' + eddb.ship[shipid].name + '</button>';
			updateUIShipyardRow(UI_SHIPYARD_SHIPS_COLS, tr, cache.shipBuild[shipid]);
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		
		div.appendChild(table);
		document.getElementById('shipyard_container').appendChild(div);
	}; // initUIShipyardShips()
	
	
	var initUIShipyardStoredBuilds = function() {
		var div = document.createElement('div');
		div.id = 'shipyard_storedbuilds_container';
		
		var table = document.createElement('table');
		table.id = 'shipyard_storedbuilds_table';
		var thead = createUIShipyardHeader(UI_SHIPYARD_STOREDBUILD_COLS);
		table.appendChild(thead);
		var tbody = document.createElement('tbody');
		tbody.id = 'shipyard_storedbuilds_tbody';
		table.appendChild(tbody);
		
		div.appendChild(table);
		document.getElementById('shipyard_container').appendChild(div);
		
		// TODO: stored build notice
		var div2 = document.createElement('div');
		div2.style.marginTop = '2em';
		div2.style.color = 'red';
		div2.innerHTML = 'Stored builds are re-copied from the live site on each visit; changes made here will not affect live site builds.';
		div.appendChild(div2);
	}; // initUIShipyardStoredBuilds()
	
	
	var createUIShipyardHeader = function(columns) {
		var thead = document.createElement('thead');
		
		var tr = document.createElement('tr');
		tr.className = 'colgroup';
		var colgroup = '';
		var colspan = 0;
		for (var c = 0;  c <= columns.length;  c++) {
			var col = (UI_SHIPYARD_COL[columns[c]] || EMPTY_OBJ);
			if (!columns[c] || (col.colgroup || '').trim() != colgroup) {
				if (colspan > 0) {
					var th = document.createElement('th');
					th.colSpan = colspan;
					th.className = (colgroup ? 'colgroup' : '');
					th.innerHTML = (colgroup || '');
					tr.appendChild(th);
				}
				colgroup = (col.colgroup || '').trim();
				colspan = 0;
			}
			colspan++;
		}
		thead.appendChild(tr);
		
		var tr = document.createElement('tr');
		var colgroup = '';
		for (var c = 0;  c < columns.length;  c++) {
			var col = (UI_SHIPYARD_COL[columns[c]] || EMPTY_OBJ);
			var th = document.createElement('th');
			th.className = ((col.colgroup ? 'colgroup ': '') + ((col.colgroup != colgroup) ? 'first ' : '') + (col.css || ''));
			colgroup = col.colgroup;
			if (col.header) {
				var abbr = document.createElement('abbr');
				abbr.innerHTML = col.header;
				th.appendChild(abbr);
			}
			tr.appendChild(th);
		}
		thead.appendChild(tr);
		
		return thead;
	}; // createUIShipyardHeader()
	
	
	var createUIShipyardRow = function(columns) {
		var tr = document.createElement('tr');
		var colgroup = '';
		for (var c = 0;  c < columns.length;  c++) {
			var col = (UI_SHIPYARD_COL[columns[c]] || EMPTY_OBJ);
			var td = document.createElement('td');
			td.className = ((col.colgroup ? 'colgroup ': '') + ((col.colgroup != colgroup) ? 'first ' : '') + (col.css || ''));
			colgroup = col.colgroup;
			tr.appendChild(td);
		}
		return tr;
	}; // createUIShipyardRow()
	
	
	var updateUIShipyardRow = function(columns, tr, build) {
		var shipslot = (build ? build.getSlot('ship', 'hull') : null);
		var html, value;
		for (var c = 0;  c < columns.length;  c++) {
			var col = UI_SHIPYARD_COL[columns[c]];
			if (col && !col.nochange) {
				if (!build) {
					html = '';
				} else if (col.render) {
					html = col.render(build);
				} else {
					if (col.buildstat) {
						value = build.getStat(col.buildstat);
					} else if (col.shipattr && shipslot) {
						value = shipslot.getEffectiveAttrValue(col.shipattr);
					} else {
						value = '';
					}
					html = formatAttrHTML(col.attr, value, col.scale);
				}
				tr.cells[c].innerHTML = html;
			}
		}
		return true;
	}; // updateUIShipyardRow()
	
	
	var updateUIShipyardStoredBuilds = function() {
		var tbody = document.getElementById('shipyard_storedbuilds_tbody');
		
		// remove all that were deleted
		var r = tbody.rows.length;
		while (r-- > 0) {
			var namehash = tbody.rows[r].id.split('.')[1];
			if (namehash && !current.storedbuild[0][namehash])
				tbody.removeChild(tbody.rows[r]);
		}
		
		// add or update all that currently exist
		var names = [];
		var nameNamehash = {};
		for (namehash in current.storedbuild[0]) {
			var name = hashDecodeS(namehash);
			names.push(name);
			nameNamehash[name] = namehash;
		}
		names.sort();
		for (var n = 0;  n < names.length;  n++) {
			updateUIShipyardStoredBuild(nameNamehash[names[n]], null, true);
		}
		
		return true;
	}; // updateUIShipyardStoredBuilds()
	
	
	var updateUIShipyardStoredBuild = function(namehash, build, sorted) {
		if (!namehash)
			return false;
		var buildhash = current.storedbuild[0][namehash];
		var tbody = document.getElementById('shipyard_storedbuilds_tbody');
		var tr = document.getElementById('shipyard_storedbuild.' + namehash);
		if (buildhash) {
			if (!build)
				build = Build.fromHash(buildhash);
			if (!tr) {
				tr = createUIShipyardRow(UI_SHIPYARD_STOREDBUILD_COLS);
				tr.id = 'shipyard_storedbuild.' + namehash;
				tr.cells[0].innerHTML = '<button name="storedbuild_reload" value="'+namehash+'" class="label">'+encodeHTML(hashDecodeS(namehash))+'</button>';
				tr.cells[1].innerHTML = '<button name="storedbuild_rename" value="'+namehash+'">' + HTML_ICON['rename'] + '</button><button name="storedbuild_delete" value="'+namehash+'">'+ HTML_ICON['delete'] + '</button>';
				tr.cells[2].innerHTML = eddb.ship[build.getShipID()].name;
				tbody.appendChild(tr);
			} else if (sorted) {
				tbody.appendChild(tr);
			}
			updateUIShipyardRow(UI_SHIPYARD_STOREDBUILD_COLS, tr, build);
		} else {
			if (tr)
				tr.parentNode.removeChild(tr);
		}
		return true;
	}; // updateUIShipyardStoredBuild()
	
	
	var setUIShipyardTab = function(tab) {
		current.shipyard_tab = tab;
		document.forms.shipyard.elements.tab.value = tab;
		document.forms.shipyard.className = tab;
	}; // setUIShipyardTab()
	
	
	/*
	* OUTFITTING UI
	*/
	
	
	var updateUIFullscreen = function() {
		var doc = window.document;
		var supported = (cache.feature.requestFullscreen && cache.feature.cancelFullscreen);
		var active = (doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);
		document.getElementById('window_maximize').style.display = ((active || !supported) ? 'none' : 'inline-block');
		document.getElementById('window_minimize').style.display = ((active &&  supported) ? 'inline-block' : 'none');
	}; // updateUIFullscreen()
	
	
	var updateUILayout = function() {
		var divBody = document.getElementById('outfitting_fit_body');
		var colWidth = max(document.getElementById('slots_column_left').offsetWidth, document.getElementById('slots_column_right').offsetWidth);
		var nameWidth = min(document.getElementById('outfitting_fit_module_ship_hull').offsetWidth, document.getElementById('outfitting_fit_module_ship_hatch').offsetWidth);
		var onecol = (current.outfitting_onecol ? (colWidth - nameWidth + 120 > 0.5 * divBody.clientWidth) : (divBody.scrollWidth > divBody.clientWidth));
		if (current.outfitting_onecol != onecol) {
			current.outfitting_onecol = onecol;
			var tableLeft = document.getElementById('slots_table_left');
			var tableRight = document.getElementById('slots_table_right');
			var tr = document.getElementById('outfitting_fit_slot_ship_hatch');
			(onecol ? tableLeft : tableRight).tBodies[0].appendChild(tr);
			for (var g = 0;  g < GROUPS.length;  g++) {
				var slotgroup = GROUPS[g];
				var tbody = document.getElementById('outfitting_fit_' + slotgroup);
				((onecol || slotgroup === 'hardpoint' || slotgroup === 'component') ? tableLeft : tableRight).appendChild(tbody);
			}
			document.getElementById('slots_column_right').style.display = (onecol ? 'none' : '');
		}
		return true;
	}; // updateUILayout()
	
	
	var getUIOutfittingSlot = function() {
		switch (current.outfitting_focus) {
		case 'module':  return current.pickerSlot;
		case 'slot':    return current.fit.getSlot(current.group, current.slot);
		}
		return null;
	}; // getUIOutfittingSlot()
	
	
	var setUIOutfittingFocus = function(focus) {
		if (focus !== 'module' && focus !== 'slot')
			return false;
		current.outfitting_focus = focus;
		document.getElementById('page_body_outfitting').className = 'focus' + focus;
		document.getElementById('outfitting_details_button_replace').innerHTML = ((focus === 'module') ? 'Install' : 'Replace');
		return true;
	}; // setUIOutfittingFocus()
	
	
	var setUIOutfittingPanels = function(show1, show2a, show2b) {
		if (show1) {
			current.outfitting_show1 = show1;
		}
		if (show2a) {
			if (show2b) {
				current.outfitting_show2b = show2b;
				current.outfitting_show2a = show2a;
			} else {
				if (current.outfitting_show2a !== show2a)
					current.outfitting_show2b = current.outfitting_show2a;
				current.outfitting_show2a = show2a;
			}
		}
		document.getElementById('outfitting_top').className = (
			'show1' + current.outfitting_show1 +
			' show2' + current.outfitting_show2a +
			' show2' + current.outfitting_show2b
		);
		return true;
	}; // setUIOutfittingPanels()
	
	
	var importBuild = function(text) {
		// if it's valid (optionally URI-encoded) base64, assume it's also gzipped
		var b64text = null;
		try {
			b64text = decodeURIComponent(text.replace(/[ \t\r\n]+/g, ''));
			var gzdata = atob((b64text + '===').slice(0, b64text.length + ((4 - (b64text.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
			var gztext = pako.inflate(gzdata, {to:'string'});
			text = gztext;
		} catch (exc) {
			b64text = null;
		}
		
		// initialize storage for possibly decoding multiple builds; index 0 is for container-level errors
		var errors = [ [] ];
		var builds = [ null ];
		
		// identify the format by the first line
		text = text.trim();
		var line1 = text.slice(0, text.indexOf('\n')).trim();
		if (line1.match(/^[a-z]+:\/\/[^#]*edshipyard[^#]*#/i)) { // URL hash(es)
			var urls = text.match(/[a-z]+:\/\/[^#]+#[^ \t\r\n#]*/ig);
			for (var i = 0;  i < urls.length;  i++) {
				var urlhash = urls[i].slice(urls[i].indexOf('#'));
				var parts = urlhash.split('/');
				if (parts[0] === '#') {
					for (var p = 1;  p < parts.length;  p++) {
						if (parts[p].slice(0,2) === 'L=') {
							errors.push([]);
							builds.push(Build.fromHash(parts[p].slice(2), errors[errors.length - 1]));
						} else if (parts[p].slice(0,2) === 'I=') {
							errors[0].push('Nested import URL hash: ' + urlhash.slice(0,8) + (urlhash.length > 8 ? '...' : ''));
						}
					}
				} else {
					errors[0].push('Invalid URL hash: ' + urlhash.slice(0,8) + (urlhash.length > 8 ? '...' : ''));
				}
			}
		} else if (line1.match(/^\[[ a-z0-9_-]+(,[^\[\]]+)?\] *(\[[^\[\]]+\])?$/i)) { // plain text
			// TODO: plain text import? does anybody actually use it?
		} else if (line1[0] === '[' || line1[0] === '{') {
			var json = null;
			try {
				json = JSON.parse(text);
			} catch (exc) {
				json = null;
			}
			if (!json) {
				try {
					// maybe it's a full Journal file
					text = '[ '+text.replace(/\}[ \t]*[\r\n]+[ \t]*\{/g,'}, {')+' ]';
					json = JSON.parse(text);
				} catch (exc) {
					console.log(exc);
					json = null;
				}
			}
			if (json) {
				if (((json['$schema'] || ((json[0] || EMPTY_OBJ)['$schema'])) || '').indexOf('coriolis.io') >= 0) { // Coriolis detailed export
					// TODO: coriolis import
					errors[0].push('Coriolis import is not yet implemented');
				} else if (json['event'] || (json[0] || EMPTY_OBJ)['event']) { // journal event(s)
					if (isNaN(json.length)) {
						json = [ json ];
					}
					var index;
					var shipidIndex = {};
					for (var i = 0;  i < json.length;  i++) {
						if (json[i]['event'] === 'Loadout') {
							if (json[i]['ShipID']) {
								index = shipidIndex[json[i]['ShipID']] || errors.length;
								shipidIndex[json[i]['ShipID']] = index;
								errors[index] = [];
							}
							builds[index] = decodeJournalBuild(json[i], errors[index]);
						}
					}
				} else if ((json.name && json.modules) || json.ship || json.ships) { // CAPI /profile endpoint
					var shiplist = [];
					if (json.name && json.modules) {
						shiplist.push(json);
					} else {
						var activeid = (json.ship || EMPTY_OBJ).id;
						if (json.ship && json.ship.name && json.ship.modules)
							shiplist.push(json.ship);
						for (var otherid in (json.ships || EMPTY_OBJ)) {
							if (json.ships[otherid].id != activeid && json.ships[otherid].name && json.ships[otherid].modules)
								shiplist.push(json.ships[otherid]);
						}
					}
					for (var i = 0;  i < shiplist.length;  i++) {
						errors.push([]);
						builds.push(decodeCAPIBuild(shiplist[i], errors[errors.length - 1]));
					}
				} else {
					errors[0].push('Unrecognized JSON format');
				}
			} else {
				errors[0].push('Invalid JSON encoding');
			}
		} else {
			errors[0].push('Unrecognized format');
		}
		
		// see what we got (remember builds[0] is a placeholder)
		if (builds.length < 2) {
			errors[0].push('No builds found');
			alert('Import failed:\n\n' + errors[0].join('\n'));
		} else if (builds.length == 2) {
			if (builds[1]) {
				setCurrentFit(builds[1]);
				if (errors[1].length > 0) {
					alert('Build imported with errors:\n\n' + errors[1].join('\n'))
				}
			} else {
				alert('Import failed:\n\n' + errors[1].join('\n'));
			}
		} else {
			alert('Found '+(builds.length - 1)+' builds');
			// TODO: multiple builds
		}
		
		/*
				b64text = text; // TODO debug
				if (!b64text) {
					try {
						b64text = text.replace(/[ \t\r\n]+/g, '');
						b64text = pako.gzip(b64text, {to:'string'});
						b64text = btoa(b64text);
						b64text = b64text.replace(/.{80}/g, function(a) { return a+'\n'; });
					} catch (exc) {
						b64text = text;
					}
					
				}
		*/
	}; // importBuild()
	
	
	var getFdevImportMap = function() {
		if (!cache.fdevmap) {
			var fdevmap = {
				ship: {},
				shipModule: {},
				module: {},
				mtypeBlueprint: {},
				slotGroup: {
					HUGEHARDPOINT    : 'hardpoint',
					LARGEHARDPOINT   : 'hardpoint',
					MEDIUMHARDPOINT  : 'hardpoint',
					SMALLHARDPOINT   : 'hardpoint',
					TINYHARDPOINT    : 'utility',
					ARMOUR           : 'component',
					POWERPLANT       : 'component',
					MAINENGINES      : 'component',
					FRAMESHIFTDRIVE  : 'component',
					LIFESUPPORT      : 'component',
					POWERDISTRIBUTOR : 'component',
					RADAR            : 'component',
					FUELTANK         : 'component',
					MILITARY         : 'military',
					SLOT             : 'internal',
				},
				slotNum : {
					ARMOUR           : CORE_ABBR_SLOT.BH,
					POWERPLANT       : CORE_ABBR_SLOT.PP,
					MAINENGINES      : CORE_ABBR_SLOT.TH,
					FRAMESHIFTDRIVE  : CORE_ABBR_SLOT.FD,
					LIFESUPPORT      : CORE_ABBR_SLOT.LS,
					POWERDISTRIBUTOR : CORE_ABBR_SLOT.PD,
					RADAR            : CORE_ABBR_SLOT.SS,
					FUELTANK         : CORE_ABBR_SLOT.FT,
				},
				attrField: {},
			};
			
			// current ship and ship-module mappings
			for (var shipid in eddb.ship) {
				var ship = eddb.ship[shipid];
				var fdid = ship.fdid;
				if (fdid)
					fdevmap.ship[fdid] = shipid;
				var fdname = (ship.fdname || '').trim().toUpperCase();
				if (fdname)
					fdevmap.ship[fdname] = shipid;
				
				fdevmap.shipModule[shipid] = {};
				for (var modid in ship.module) {
					var fdid = ship.module[modid].fdid || eddb.module[modid].fdid;
					if (fdid)
						fdevmap.shipModule[shipid][fdid] = modid;
					var fdname = (ship.module[modid].fdname || eddb.module[modid].fdname || '').trim().toUpperCase();
					if (fdname)
						fdevmap.shipModule[shipid][fdname] = modid;
				}
			}
			
			// current module mappings
			for (var modid in eddb.module) {
				var module = eddb.module[modid];
				var fdid = module.fdid;
				if (fdid)
					fdevmap.module[fdid] = modid;
				var fdname = (module.fdname || '').trim().toUpperCase();
				if (fdname)
					fdevmap.module[fdname] = modid;
			}
			
			// blueprint mappings are per-mtype
			for (var mtypeid in eddb.mtype) {
				// current blueprint mappings
				fdevmap.mtypeBlueprint[mtypeid] = {};
				var mtype = eddb.mtype[mtypeid];
				for (var b = 0;  b < (mtype.blueprints || EMPTY_ARR).length;  b++) {
					var bpid = mtype.blueprints[b];
					if (eddb.blueprint[bpid]) {
						var fdname = (eddb.blueprint[bpid].fdname || '').trim().toUpperCase();
						fdevmap.mtypeBlueprint[mtypeid][fdname] = bpid;
					}
				}
				
				// renamed blueprint mappings
				for (var bpname in { LIGHTWEIGHT:1, REINFORCED:1, SHIELDED:1 }) {
					if (fdevmap.mtypeBlueprint[mtypeid]['MISC_' + bpname]) {
						for (var modtype in { CHAFFLAUNCHER:1, ECM:1, HEATSINKLAUNCHER:1, KILLWARRANTSCANNER:1, CARGOSCANNER:1, POINTDEFENCE:1, WAKESCANNER:1, LIFESUPPORT:1, COLLECTIONLIMPET:1, FUELTRANSFERLIMPET:1, HATCHBREAKERLIMPET:1, PROSPECTINGLIMPET:1 }) {
							fdevmap.mtypeBlueprint[mtypeid][modtype + '_' + bpname] = fdevmap.mtypeBlueprint[mtypeid]['MISC_' + bpname];
						}
					}
				}
				for (var bpname in { FASTSCAN:1, LONGRANGE:1, WIDEANGLE:1 }) {
					if (fdevmap.mtypeBlueprint[mtypeid]['SENSOR_' + bpname]) {
						for (var modtype in { SENSOR_KILLWARRANTSCANNER:1, KILLWARRANTSCANNER:1, SENSOR_CARGOSCANNER:1, SENSOR_WAKESCANNER:1, SENSOR_SENSOR:1, SENSOR_SURFACESCANNER:1 }) {
							fdevmap.mtypeBlueprint[mtypeid][modtype + '_' + bpname] = fdevmap.mtypeBlueprint[mtypeid]['SENSOR_' + bpname];
						}
					}
				}
				fdevmap.mtypeBlueprint[mtypeid]['CHAFFLAUNCHER_CHAFFCAPACITY'] = fdevmap.mtypeBlueprint[mtypeid]['MISC_CHAFFCAPACITY'];
				fdevmap.mtypeBlueprint[mtypeid]['HEATSINKLAUNCHER_HEATSINKCAPACITY'] = fdevmap.mtypeBlueprint[mtypeid]['MISC_HEATSINKCAPACITY'];
				fdevmap.mtypeBlueprint[mtypeid]['POINTDEFENCE_POINTDEFENSECAPACITY'] = fdevmap.mtypeBlueprint[mtypeid]['MISC_POINTDEFENSECAPACITY'];
				fdevmap.mtypeBlueprint[mtypeid]['SENSOR_SENSOR_LIGHTWEIGHT'] = fdevmap.mtypeBlueprint[mtypeid]['SENSOR_LIGHTWEIGHT'];
				if (fdevmap.mtypeBlueprint[mtypeid]['MISC_SHIELDED']) {
					for (var modtype in { AFM:1, FUELSCOOP:1, REFINERIES:1 }) {
						fdevmap.mtypeBlueprint[mtypeid][modtype + '_SHIELDED'] = fdevmap.mtypeBlueprint[mtypeid]['MISC_SHIELDED'];
					}
				}
			}
			
			// reverse map fdfieldattr (which is many-to-one, so the reverse map won't be perfect but it'll do)
			for (var field in eddb.fdfieldattr) {
				var attr = eddb.fdfieldattr[field]
				if (attr)
					fdevmap.attrField[attr] = field;
			}
			
			cache.fdevmap = fdevmap;
		}
		return cache.fdevmap;
	}; // getFdevImportMap()
	
	
	var decodeCAPIBuild = function(shipobj, errors, unknowns) {
		var fdevmap = getFdevImportMap();
		var shipid = fdevmap.ship[shipobj["name"].trim().toUpperCase()];
		var eventobj = {
			"event": "Loadout",
			"Ship": shipobj["name"],
			"ShipID": (shipobj["id"] | 0),
			"ShipName": shipobj["shipName"],
			"ShipIdent": shipobj["shipID"],
			"HullValue": (shipobj["value"] || EMPTY_OBJ)["hull"],
			"ModulesValue": (shipobj["value"] || EMPTY_OBJ)["modules"],
		//	"Rebuy": undefined, // not returned by CAPI
		};
		for (var slotname in (shipobj["modules"] || EMPTY_OBJ)) {
			var slotobj = shipobj["modules"][slotname];
			var moduleobj = slotobj["module"];
			if (moduleobj) {
				var eventslotobj = {
					"Slot": slotname,
					"Item": moduleobj["name"],
				//	"ItemID": moduleobj["id"], // not actually part of the Journal Loadout spec
					"On": moduleobj["on"],
					"Priority": moduleobj["priority"],
					"Health": parseFloat(moduleobj["health"]) / 1000000,
					"Value": moduleobj["free"] ? 0 : moduleobj["value"],
				};
				var engineerobj = (slotobj["engineer"] || (moduleobj || EMPTY_OBJ)["modifiers"]);
				var modifierobj = (slotobj["modifications"] || slotobj["WorkInProgress_modifications"]);
				var modifierarr = (engineerobj || EMPTY_OBJ)["modifiers"];
				var specialobj = slotobj["specialModifications"];
				if (engineerobj || modifierobj || modifierarr || specialobj) {
					var modulename = (moduleobj["name"] || '').trim();
					var fdname = modulename.toUpperCase();
					var modid = fdevmap.shipModule[shipid][fdname] || fdevmap.module[fdname];
					var module = cache.shipModules[shipid][modid] || eddb.module[modid];
					var eventengobj = {
						"Engineer": (engineerobj || EMPTY_OBJ)["engineerName"],
						"EngineerID": (engineerobj || EMPTY_OBJ)["engineerId"],
						"BlueprintID": (engineerobj || EMPTY_OBJ)["recipeID"], // before 2.3
						"BlueprintName": ((engineerobj || EMPTY_OBJ)["recipeName"] || (moduleobj || EMPTY_OBJ)["recipeName"]),
						"Level": ((engineerobj || EMPTY_OBJ)["recipeLevel"] || (moduleobj || EMPTY_OBJ)["recipeLevel"]),
					//	"Quality": undefined, // not returned by CAPI
						"Modifiers": [],
					};
					
					for (var expid in (specialobj || EMPTY_OBJ)) {
						if (expid === 'special_plasma_slug' && module.mtype === 'hrg')
							expid = 'special_plasma_slug_cooled';
						eventengobj["ExperimentalEffect"] = expid;
						if (!modifierarr)
							modifierarr = [];
						modifierarr.push({ name:expid, value:1 });
					}
					
					var modifiers = {};
					var mod_weapon_falloffrange_from_range = false;
					
					if (modifierobj) { // after 2.4
						for (var field in modifierobj) {
							var attr = eddb.fdfieldattr[field];
							var modifier = parseFloat(modifierobj[field]["value"]);
							if (attr === 'rof') {
								attr = 'bstint';
								modifier = (1 / (modifier - 1)) + 1;
							}
							var attribute = eddb.attribute[attr];
							if (attr === null || (attr && !isModuleAttrModifiable(module, attr))) {
								// ignore
							} else if (attribute) {
								if (attribute.modmod && attr !== 'shieldbst') {
									// CAPI returns modmods (except shieldbst) as final effective values rather than modifiers to base values
									modifiers[attr] = getModuleAttrModifier(module, attr, attribute.modmod * (modifier - 1));
								} else {
									modifiers[attr] = (attribute.modset ? modifier : getAttrModifierSum(attr, modifiers[attr], modifier - 1));
								}
							} else if (unknowns) {
								var tag = slotname + ': ' + modulename;
								if (!unknowns[tag])
									unknowns[tag] = {};
								unknowns[tag][field] = 1;
							} else if (errors) {
								errors.push(tag + ': Unknown field: ' + field);
							}
						}
					}
					
					if (modifierarr) { // before 2.3
						for (var m = 0;  m < modifierarr.length;  m++) {
							var field = modifierarr[m].name;
							if (eddb.fdexpeffect[field])
								eventengobj["ExperimentalEffect"] = field;
							var fieldmodifier = parseFloat(modifierarr[m].value);
							var attrmods = eddb.fdattrmod[field];
							if (field === 'mod_weapon_clip_size_override') {
								modifiers['ammoclip'] = getModuleAttrModifier(module, 'ammoclip', fieldmodifier);
							} else if (field === 'mod_weapon_falloffrange_from_range') {
								mod_weapon_falloffrange_from_range = true;
							} else if (attrmods) {
								for (var attr in attrmods) {
									var attribute = eddb.attribute[attr];
									var modifier = fieldmodifier * attrmods[attr];
									modifiers[attr] = (attribute.modset ? modifier : getAttrModifierSum(attr, modifiers[attr], modifier));
								}
							} else if (unknowns) {
								var tag = slotname + ': ' + modulename;
								if (!unknowns[tag])
									unknowns[tag] = {};
								unknowns[tag][field] = 1;
							} else if (errors) {
								errors.push(tag + ': Unknown field: ' + field);
							}
						}
					}
					
					if (mod_weapon_falloffrange_from_range && modifiers['maxrng']) {
						modifiers['dmgfall'] = getModuleAttrModifier(module, 'dmgfall', getModuleAttrValue(module, 'maxrng', modifiers['maxrng']));
					}
					if (modifiers['bstint']) {
						// translate bstint back to rof, considering modified bstsize/bstrof
						var bstsize = getModuleAttrValue(module, 'bstsize', modifiers['bstsize']);
						var bstrof = getModuleAttrValue(module, 'bstrof', modifiers['bstrof']);
						var bstint = getModuleAttrValue(module, 'bstint', modifiers['bstint']);
						modifiers['rof'] = getModuleAttrModifier(module, 'rof', (bstsize / ((bstsize - 1) / bstrof + bstint)) * (1 + (modifiers['rof'] || 0)));
						delete modifiers['bstint'];
					}
					
					for (var attr in modifiers) {
						var modifier = modifiers[attr];
						var field = fdevmap.attrField[attr];
						if (modifier && field) {
							eventengobj["Modifiers"].push({
								"Label": field.slice(field.indexOf('_') + 1),
								"Value": getModuleAttrValue(module, attr, modifier),
							});
						}
					}
					
					eventslotobj["Engineering"] = eventengobj;
				}
				if (!eventobj["Modules"])
					eventobj["Modules"] = [];
				eventobj["Modules"].push(eventslotobj);
			}
		}
//console.log(JSON.stringify(eventobj));
		return decodeJournalBuild(eventobj, errors);
	}; // decodeCAPIBuild()
	
	
	var decodeJournalBuild = function(json, errors) {
		var fdevmap = getFdevImportMap();
		var shipid = fdevmap.ship[json.Ship.trim().toUpperCase()];
		var ship = eddb.ship[shipid];
		if (!ship) {
			if (errors) errors.push('Invalid ship: ' + json.Ship);
			return null;
		}
		
		var build = new Build(shipid);
		if (json.ShipName && !build.setName(json.ShipName)) {
			if (errors) errors.push('Invalid ship name: ' + json.ShipName);
		}
		if (json.ShipIdent && !build.setNameTag(json.ShipIdent)) {
			if (errors) errors.push('Invalid ship ID: ' + json.ShipIdent);
		}
		
		// build and align slot index maps
		var extravalue = 0;
		var groupSlotnames = { ship:[] };
		var groupSlotnums = { ship:[] };
		for (var slotgroup in eddb.group) {
			groupSlotnames[slotgroup] = [];
			groupSlotnums[slotgroup] = [];
			for (var s = 0;  s < ship.slots[slotgroup].length;  s++)
				groupSlotnums[slotgroup].push(s);
		}
		var slotModule = {};
		var slotNum = {};
		var slotSize = {};
		for (var m = 0;  m < (json.Modules || EMPTY_ARR).length;  m++) {
			var modulejson = json.Modules[m];
			var slotname = (modulejson.Slot || '').trim().toUpperCase();
			var tokens = slotname.match(/^([A-Z]+)([0-9]*)(?:_SIZE([0-9]+))?$/);
			var slotgroup = fdevmap.slotGroup[(tokens || EMPTY_OBJ)[1]];
			if (groupSlotnames[slotgroup]) {
				groupSlotnames[slotgroup].push(slotname);
				slotModule[slotname] = modulejson;
				slotNum[slotname] = fdevmap.slotNum[slotname] || parseInt(tokens[2] || 0);
				slotSize[slotname] = ((slotgroup === 'hardpoint') ? 'TSMLH'.indexOf(slotname[0]) : parseInt(tokens[3] || 0));
			} else if (slotname === 'PLANETARYAPPROACHSUITE') {
				// special handling for the approach suite, just to add its value to the ship hull value since we don't track them separately
				var fdname = (modulejson.Item || '').trim().toUpperCase();
				if (fdname === 'INT_PLANETAPPROACHSUITE') {
					extravalue += (modulejson.Value || 0);
				}
			} else if (slotname === 'CARGOHATCH') {
				// special handling for the cargo hatch, just for powered and priority settings
				var slot = build.getSlot('ship', 'hatch');
				var fdname = (modulejson.Item || '').trim().toUpperCase();
				if (fdname === 'MODULARCARGOBAYDOOR') {
					if (!slot.setPowered(modulejson.On)) {
						if (errors) errors.push(modulejson.Slot + ': Invalid powered setting: ' + modulejson.On);
					}
					if (!slot.setPriority(parseInt(modulejson.Priority) + 1)) {
						if (errors) errors.push(modulejson.Slot + ': Invalid priority setting: ' + modulejson.Priority);
					}
				} else if (errors) errors.push(modulejson.Slot + ': Invalid module: ' + modulejson.Item);
			}
		}
		
		// apply the hull discount
		var slot = build.getSlot('ship', 'hull');
		if (!slot.setDiscounts(getClosestDiscount(((json.HullValue || 0) + extravalue) / ship.cost))) {
			if (errors) errors.push('Failed to calculate discounted hull value: ' + json.HullValue + '+' + extravalue + ' vs base ' + ship.cost);
		}
		
		for (var slotgroup in eddb.group) {
			if (slotgroup !== 'component') {
				// sort by descending size, then ascending index
				groupSlotnames[slotgroup].sort(function(n1,n2) { return ((slotSize[n1] != slotSize[n2]) ? (slotSize[n2] - slotSize[n1]) : (slotNum[n1] - slotNum[n2])); });
				groupSlotnums[slotgroup].sort(function(s1,s2) { return ((ship.slots[slotgroup][s1] != ship.slots[slotgroup][s2]) ? (ship.slots[slotgroup][s2] - ship.slots[slotgroup][s1]) : (s1 - s2)); });
				// if import slots are too few, add gaps starting with the last one that can't be shifted
				var numgaps = groupSlotnums[slotgroup].length - groupSlotnames[slotgroup].length;
				if (numgaps > 0) {
					var slotmove = [];
					for (var i = 0;  i < groupSlotnames[slotgroup].length;  i++) {
						slotmove[i] = numgaps;
						while (slotmove[i] > 0 && slotSize[groupSlotnames[slotgroup][i]] > ship.slots[slotgroup][groupSlotnums[slotgroup][i + slotmove[i]]])
							slotmove[i]--;
					}
					var gaps = [];
					while (gaps.length < numgaps) {
						var i = slotmove.length;
						while (i > 0 && slotmove[i - 1] > gaps.length)
							i--;
						gaps.push(i);
					}
					while (gaps.length > 0)
						groupSlotnames[slotgroup].splice(gaps.pop(), 0, null);
				} else if (numgaps < 0) {
					errors.push('Too many ' + slotgroup + ' slots');
				}
			}
		}
		
		// map and decode import slots
		for (var slotgroup in eddb.group) {
			for (var i = 0, s = 0;  i < groupSlotnames[slotgroup].length && s < groupSlotnums[slotgroup].length;  i++, s++) {
				var modulejson = slotModule[groupSlotnames[slotgroup][i]];
				if (modulejson) {
					var slotnum = ((slotgroup === 'component') ? slotNum[groupSlotnames[slotgroup][i]] : groupSlotnums[slotgroup][s]);
					var slot = build.getSlot(slotgroup, slotnum);
					if (slot) {
						var fdname = (modulejson.Item || '').trim().toUpperCase();
						var modid = fdevmap.shipModule[shipid][fdname] || fdevmap.module[fdname];
						if (modid) {
							if (slot.setModuleID(modid)) {
								var modvalue = modulejson.Value || 0;
								var basecost = build.getModule(modid).cost;
								if (!slot.setDiscounts(basecost ? getClosestDiscount(modvalue / basecost) : 0)) {
									if (errors) errors.push(modulejson.Slot + ': Failed to calculate discounted value: ' + modulejson.Value + ' vs base ' + basecost);
								}
								var mtypeid = slot.getModule().mtype;
								if (modulejson.Engineering) {
									var fdname = (modulejson.Engineering.BlueprintName || '').trim().toUpperCase();
									var bpid = fdevmap.mtypeBlueprint[mtypeid][fdname];
									if (bpid) {
										var bpgrade = parseInt(modulejson.Engineering.Level);
										var bproll = -1;
										// pre-3.0 utility ammo blueprints only had a grade 3, which now has to be grade 1
										if (fdname === 'CHAFFLAUNCHER_CHAFFCAPACITY' || fdname === 'HEATSINKLAUNCHER_HEATSINKCAPACITY' || fdname === 'POINTDEFENCE_POINTDEFENSECAPACITY')
											bpgrade = 1;
										if (!slot.setBlueprint(bpid, bpgrade, bproll)) {
											if (errors) errors.push(modulejson.Slot + ': Invalid blueprint: ' + modulejson.Engineering.BlueprintName);
										}
									} else if (modulejson.Engineering.BlueprintName && errors) errors.push(modulejson.Slot + ': Unknown blueprint: ' + modulejson.Engineering.BlueprintName);
									
									var expid = eddb.fdexpeffect[(modulejson.Engineering.ExperimentalEffect || '').trim().toLowerCase()];
									if (expid) {
										if (!slot.setExpeffectID(expid)) {
											if (errors) errors.push(modulejson.Slot + ': Invalid experimental: ' + modulejson.Engineering.ExperimentalEffect);
										}
									} else if (modulejson.Engineering.ExperimentalEffect && errors) errors.push(modulejson.Slot + ': Unknown experimental: ' + modulejson.Engineering.ExperimentalEffect);
									
									var modifier_rof = null;
									for (var m = 0;  m < (modulejson.Engineering.Modifiers || EMPTY_ARR).length;  m++) {
										var modjson = modulejson.Engineering.Modifiers[m];
										var attr = eddb.fdfieldattr['OutfittingFieldType_' + modjson.Label];
										if (attr) {
											var module = slot.getModule();
											var base = parseFloat(modjson.OriginalValue);
											if (isNaN(base))
												base = getModuleAttrValue(module, attr);
											var modifier = getAttrModifier(attr, base, parseFloat(modjson.Value));
											if (attr === 'rof') {
												modifier_rof = modifier;
											} else if (!isModuleAttrModifiable(module, attr)) {
												// ignore unmodifiable attributes, Journal includes them all the time (mass on lightweight bulkheads, shotspd, etc)
											} else if (!slot.setEffectiveAttrModifier(attr, modifier)) {
												if (errors) errors.push(modulejson.Slot + ': Invalid modifier: ' + modjson.Label + '=' + modjson.Value);
											}
										} else if (attr !== null && errors) errors.push(modulejson.Slot + ': Modifier #' + (m+1) + ': Unknown attribute: ' + modjson.Label);
									}
									// apply ROF last, so it takes into account bstsize/bstrof
									if (modifier_rof) {
										slot.setEffectiveAttrModifier('rof', modifier_rof);
									}
								}
							} else if (errors) errors.push(modulejson.Slot + ': Invalid module: ' + modulejson.Item);
						} else if (modulejson.Item && errors) errors.push(modulejson.Slot + ': Unknown module: ' + modulejson.Item);
						
						if (!slot.setPowered(modulejson.On)) {
							if (errors) errors.push(modulejson.Slot + ': Invalid powered setting: ' + modulejson.On);
						}
						
						if (!slot.setPriority(parseInt(modulejson.Priority) + 1)) {
							if (errors) errors.push(modulejson.Slot + ': Invalid priority setting: ' + modulejson.Priority);
						}
					} else if (errors) errors.push(modulejson.Slot + ': Invalid slot');
				}
			}
		}
		
		return build;
	}; // decodeJournalBuild()
	
	
	var setCurrentDrag = function(modid, namehash, fromgroup, fromslot) {
		current.drag = (isNaN(modid) ? null : { id:modid, namehash:namehash, group:fromgroup, slot:fromslot });
		if (!isNaN(modid) && fromgroup) {
			document.getElementById('outfitting_modules_container').addEventListener('dragenter', onUIModulePickerDragEnter);
			document.getElementById('outfitting_modules_container').addEventListener('dragover', onUIModulePickerDragOver);
			document.getElementById('outfitting_modules_container').addEventListener('dragleave', onUIModulePickerDragLeave);
		} else {
			document.getElementById('outfitting_modules_container').removeEventListener('dragenter', onUIModulePickerDragEnter);
			document.getElementById('outfitting_modules_container').removeEventListener('dragover', onUIModulePickerDragOver);
			document.getElementById('outfitting_modules_container').removeEventListener('dragleave', onUIModulePickerDragLeave);
		}
		document.getElementById('outfitting_fit_ship_hull').className = (isNaN(modid) ? '' : 'dragerror');
		document.getElementById('outfitting_fit_ship_hatch').className = (isNaN(modid) ? '' : 'dragerror');
		for (var slotgroup in GROUP_LABEL) {
			var slot;
			for (var slotnum = 0;  slot = current.fit.getSlot(slotgroup, slotnum);  slotnum++) {
				var tr = document.getElementById('outfitting_fit_slot_' + slotgroup + '_' + slotnum);
				if (isNaN(modid)) {
					tr.className = '';
					tr.removeEventListener('dragenter', onUIFitSlotsDragEnter);
					tr.removeEventListener('dragover', onUIFitSlotsDragOver);
					tr.removeEventListener('dragleave', onUIFitSlotsDragLeave);
				} else if (!(current.option.experimental ? slot.isModuleIDValid(modid) : slot.isModuleIDAllowed(modid))) {
					tr.className = 'dragerror';
					tr.removeEventListener('dragenter', onUIFitSlotsDragEnter);
					tr.removeEventListener('dragover', onUIFitSlotsDragOver);
					tr.removeEventListener('dragleave', onUIFitSlotsDragLeave);
				} else {
					tr.className = 'dragok';
					tr.addEventListener('dragenter', onUIFitSlotsDragEnter);
					tr.addEventListener('dragover', onUIFitSlotsDragOver);
					tr.addEventListener('dragleave', onUIFitSlotsDragLeave);
				}
			}
		}
	}; // setCurrentDrag()
	
	
	/*
	* OUTFITTING PICKER UI
	*/
	
	
	var initUIModulePicker = function() {
		// build picker DOM
		var divPicker = document.createElement('div');
		divPicker.id = 'outfitting_modules_picker';
		
		var divRow = document.createElement('div');
		divRow.className = 'row empty';
		var label = document.createElement('label');
		label.className = 'togglebutton';
		label.draggable = true;
		var input = document.createElement('input');
		input.type = 'radio';
		input.id = 'outfitting_module.0.';
		input.name = 'module';
		input.value = '0.';
		var div = document.createElement('div');
		div.innerHTML = '';
		label.appendChild(input);
		label.appendChild(div);
		label.htmlFor = input.id;
		label.addEventListener('touchstart', onUIModulePickerLabelTouchStart);
		divRow.appendChild(label);
		divPicker.appendChild(divRow);
		divRow = null;
		
		for (var g = 0;  g < GROUPS.length;  g++) {
			var group = GROUPS[g];
			if (!cache.groupMtypes[group] || cache.groupMtypes[group].length < 1)
				continue;
			
			var divGroup = document.createElement('div');
			divGroup.id = 'outfitting_modules_group_' + group;
			divGroup.className = 'group ' + group;
			var header = document.createElement('header');
			header.innerHTML = GROUP_LABEL[GROUPS[g]];
			divGroup.appendChild(header);
			
			for (var t = 0;  t < cache.groupMtypes[group].length;  t++) {
				var mtype = cache.groupMtypes[group][t];
				
				var typeSizeMin = MAX_SLOT_CLASS;
				var typeSizeMax = 0;
				var divType = document.createElement('div');
				divType.id = 'outfitting_modules_mtype_' + mtype;
				var header = document.createElement('header');
				header.innerHTML = eddb.mtype[mtype].name;
				divType.appendChild(header);
				
				var divRow, divFlex, moduleSize, moduleUnique;
				for (var m = 0;  m <= cache.mtypeModules[mtype].length;  m++) {
					var mID = cache.mtypeModules[mtype][m];
					var module = eddb.module[mID];
					var nextSize = ((module || EMPTY_OBJ).class || 0) | 0;
					var nextUnique = eddb.mtype[mtype].modulenames[(module || EMPTY_OBJ).name];
					nextUnique = (nextUnique ? ((typeof nextUnique !== 'string') ? '' : ' shortname') : ' fullname');
					// close the running row when the size class changes or if the uniqueness changes or if fully unique
					if (divRow && (!module || moduleSize !== nextSize || moduleUnique !== nextUnique || nextUnique === ' fullname')) {
						divType.appendChild(divRow);
						divRow = null;
					}
					if (module) {
						moduleSize = nextSize;
						moduleUnique = nextUnique;
						if (!divRow) {
							divRow = document.createElement('div');
							divRow.id = 'outfitting_modules_mtype_' + mtype + '_size_' + moduleSize;
							var classes = group + ' ' + mtype + ' row sized size' + moduleSize;
							if (cache.mtypeSizeGaps[mtype] && cache.mtypeSizeGaps[mtype][moduleSize]) {
								classes += ' size' + cache.mtypeSizeGaps[mtype][moduleSize].join(' size');
							}
							for (var c = ((mtype === 'cls' || mtype === 'cs') ? moduleSize : MAX_SLOT_CLASS);  c >= moduleSize;  c--) {
								classes += ' fitsize' + c;
							}
							divRow.className = classes;
						}
						var label = document.createElement('label');
						label.className = 'togglebutton' + moduleUnique;
						label.draggable = true;
						var input = document.createElement('input');
						input.type = 'radio';
						input.id = 'outfitting_module.' + mID + '.';
						input.name = 'module';
						input.value = mID + '.';
						var div = document.createElement('div');
						div.innerHTML = HTML_ICON['warning'] + getModuleLabel(module, true, true);
						label.appendChild(input);
						label.appendChild(div);
						label.htmlFor = input.id;
						label.addEventListener('touchstart', onUIModulePickerLabelTouchStart);
						divRow.appendChild(label);
						typeSizeMin = min(typeSizeMin, moduleSize);
						typeSizeMax = max(typeSizeMax, moduleSize);
					}
				}
				var classes = group + ' ' + mtype + ' mtype sized';
				for (var c = typeSizeMin;  c <= MAX_SLOT_CLASS;  c++) {
					classes += ' fitsize' + c + ((c <= typeSizeMax) ? (' size' + c) : '');
				}
				divType.className = classes;
				divGroup.appendChild(divType);
			}
			divPicker.appendChild(divGroup);
		}
		document.getElementById('outfitting_modules_container').appendChild(divPicker);
	}; // initUIModulePicker()
	
	
	var updateUIModulePickerStoredModules = function() {
		// clear all group/mtype stored flags
		for (var group in cache.groupMtypes) {
			var divGroup = document.getElementById('outfitting_modules_group_' + group);
			if (divGroup)
				divGroup.classList.remove('stored');
			for (var m = 0;  m < cache.groupMtypes[group].length;  m++) {
				var divType = document.getElementById('outfitting_modules_mtype_' + cache.groupMtypes[group][m]);
				if (divType)
					divType.classList.remove('stored');
			}
		}
		
		// update all stored module picker buttons that previously or currently exist
		var nameNamehash = {};
		for (var namehash in cache.storedmodules) {
			nameNamehash[hashDecodeS(namehash)] = namehash;
		}
		cache.storedmodules = {};
		for (var namehash in current.storedmodule[0]) {
			nameNamehash[hashDecodeS(namehash)] = namehash;
		}
		var names = Object.keys(nameNamehash);
		names.sort();
		for (var n = 0;  n < names.length;  n++) {
			updateUIModulePickerStoredModule(nameNamehash[names[n]], true);
		}
		
		return true;
	}; // updateUIModulePickerStoredModules()
	
	
	var updateUIModulePickerStoredModule = function(namehash, sorted) {
		if (!namehash)
			return false;
		var modulehash = current.storedmodule[0][namehash];
		var divRow = document.getElementById('outfitting_modules_stored.' + namehash);
		if (modulehash) {
			cache.storedmodules[namehash] = 1;
			var modid = Slot.getStoredHashModuleID(modulehash);
			var module = eddb.module[modid];
			var mtypeid = module.mtype;
			var szcls = module.class;
			var divType = document.getElementById('outfitting_modules_mtype_' + mtypeid);
			if (!divRow) {
				divRow = document.createElement('div');
				divRow.id = 'outfitting_modules_stored.' + namehash;
				var classes = mtypeid + ' row stored sized size' + szcls;
				if (cache.mtypeSizeGaps[mtypeid] && cache.mtypeSizeGaps[mtypeid][szcls]) {
					classes += ' size' + cache.mtypeSizeGaps[mtypeid][szcls].join(' size');
				}
				for (var c = ((mtypeid === 'cls' || mtypeid === 'cs') ? szcls : MAX_SLOT_CLASS);  c >= szcls;  c--) {
					classes += ' fitsize' + c;
				}
				divRow.className = classes;
				var label = document.createElement('label');
				label.className = 'togglebutton fullname';
				label.draggable = true;
				var input = document.createElement('input');
				input.type = 'radio';
				input.id = 'outfitting_module.' + modid + '.' + namehash;
				input.name = 'module';
				input.value = modid + '.' + namehash;
				var div = document.createElement('div');
				div.innerHTML = HTML_ICON['warning'] + HTML_ICON['engineer'] + encodeHTML(hashDecodeS(namehash));
				label.appendChild(input);
				label.appendChild(div);
				label.htmlFor = input.id;
				label.addEventListener('touchstart', onUIModulePickerLabelTouchStart);
				divRow.appendChild(label);
				divType.appendChild(divRow);
			} else if (sorted) {
				divType.appendChild(divRow);
			}
			divType.classList.add('stored');
			divType.parentNode.classList.add('stored'); // divGroup
		} else {
			if (divRow)
				divRow.parentNode.removeChild(divRow);
		}
		return true;
	}; // updateUIModulePickerStoredModule()
	
	
	var setUIModuleTab = function(tab) {
		current.tab = tab;
		document.forms.modules.elements.tab.value = tab;
		document.forms.modules.className = tab;
	}; // setUIModuleTab()
	
	
	var setUIPickerModule = function(modid, namehash, scroll) {
		if (isNaN(modid)) {
			var tokens = document.forms.modules.elements.module.value.split('.');
			modid = tokens[0];
			namehash = tokens[1];
			var input = document.getElementById('outfitting_module.' + modid + '.' + namehash);
			if (input)
				input.checked = false;
			current.pickerSlot.setModuleID(0);
		} else {
			var input = document.getElementById('outfitting_module.' + modid + '.' + namehash);
			input.checked = true;
			if (namehash) {
				current.pickerSlot.setStoredHash(current.storedmodule[0][namehash]);
			} else {
				current.pickerSlot.setModuleID(modid);
			}
			if (scroll) {
				var container = document.getElementById('outfitting_modules_container');
				var label = input;
				while (label && label.tagName !== 'LABEL')
					label = label.parentNode;
				if (container && label && label.offsetParent) {
					var containerR = container.getBoundingClientRect();
					var labelR = label.getBoundingClientRect();
					var margin = (containerR.bottom - containerR.top - labelR.bottom + labelR.top) >> 1;
					container.scrollTop += (min(0, labelR.top - margin - containerR.top) + max(0, labelR.bottom + margin - containerR.bottom));
				}
			}
		}
		return true;
	}; // setUIPickerModule()
	
	
	/*
	* BUILD UI
	*/
	
	
	var initUIFitSlots = function() {
		var tableLeft = document.createElement('table');
		tableLeft.id = 'slots_table_left';
		
		var thead = document.createElement('thead');
		thead.appendChild(createUIFitHeaderRow());
		tableLeft.appendChild(thead);
		
		var tbody = document.createElement('tbody');
		tbody.id = 'outfitting_fit_ship_hull';
		tbody.appendChild(createUIFitSlotRow('ship', 'hull'));
		tableLeft.appendChild(tbody);
		
		var tableRight = document.createElement('table');
		tableRight.id = 'slots_table_right';
		
		var thead = document.createElement('thead');
		thead.appendChild(createUIFitHeaderRow());
		tableRight.appendChild(thead);
		
		var tbody = document.createElement('tbody');
		tbody.id = 'outfitting_fit_ship_hatch';
		tbody.appendChild(createUIFitSlotRow('ship', 'hatch'));
		tableRight.appendChild(tbody);
		
		for (var g = 0;  g < GROUPS.length;  g++) {
			var slotgroup = GROUPS[g];
			var tbody = document.createElement('tbody');
			tbody.id = 'outfitting_fit_' + slotgroup;
			tbody.appendChild(createUIFitHeaderRow(slotgroup));
			((slotgroup === 'hardpoint' || slotgroup === 'component') ? tableLeft : tableRight).appendChild(tbody);
		}
		
		document.getElementById('slots_column_left').appendChild(tableLeft);
		document.getElementById('slots_column_right').appendChild(tableRight);
	}; // initUIFitSlots()
	
	
	var createUIFitHeaderRow = function(group) {
		var tr = document.createElement('tr');
		if (group) {
			var th = document.createElement('th');
			th.className = 'outfitting_fit_class';
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_module';
			var div = document.createElement('div');
			var span = document.createElement('span');
			span.innerHTML = GROUP_LABEL[group];
			div.appendChild(span);
			th.appendChild(div);
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_mass';
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_pwrdraw';
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_attrs';
			if (group === 'hardpoint') {
				var attrs = ['dps','sdps','eps','seps','hps','shps','maxrng','ammoclip'];
				for (var i = 0;  i < 2;  i++) {
					var select = document.createElement('select');
					select.name = 'hardpoint_attr' + (i + 1);
					for (var a = 0;  a < attrs.length;  a++) {
						var option = document.createElement('option');
						option.value = attrs[a];
						option.text = (attrs[a] === 'maxrng' ? 'Range' : (attrs[a] === 'ammoclip' ? 'Ammo' : attrs[a].toUpperCase()));
						select.appendChild(option);
					}
					select.selectedIndex = i * 6; // dps,maxrng
					th.appendChild(select);
				}
			}
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_price';
			tr.appendChild(th);
		} else {
			var th = document.createElement('th');
			th.className = 'outfitting_fit_class';
			var abbr = document.createElement('abbr');
			abbr.innerHTML = 'CL';
			abbr.title = 'Slot size class';
			th.appendChild(abbr);
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_module';
			var div = document.createElement('div');
			div.innerHTML = 'Module';
			th.appendChild(div);
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_mass';
			var abbr = document.createElement('abbr');
			abbr.innerHTML = 'Mass';
			abbr.title = 'Hull or module mass (in tons)';
			th.appendChild(abbr);
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_pwrdraw';
			var abbr = document.createElement('abbr');
			abbr.innerHTML = 'P<span class="outfitting_fit_pwrdraw">o</span>w<span class="outfitting_fit_pwrdraw">e</span>r';
			abbr.title = 'Module power output or draw (in megawatts), powered status, and power priority group';
			th.appendChild(abbr);
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_attrs';
			var abbr = document.createElement('abbr');
			abbr.innerHTML = 'Attributes';
			abbr.title = 'Important attributes of each module type';
			th.appendChild(abbr);
			tr.appendChild(th);
			
			var th = document.createElement('th');
			th.className = 'outfitting_fit_price';
			var abbr = document.createElement('abbr');
			abbr.innerHTML = 'Price';
			abbr.title = 'Hull or module price (in credits); for hulls, this excludes all stock modules';
			th.appendChild(abbr);
			tr.appendChild(th);
		}
		return tr;
	}; // createUIFitHeaderRow()
	
	
	var createUIFitSlotRow = function(group, slot) {
		var group_slot = group + '_' + slot;
		var tr = document.createElement('tr');
		tr.id = 'outfitting_fit_slot_' + group_slot;
		
		var td = document.createElement('td');
		td.className = 'outfitting_fit_class';
		td.id = 'outfitting_fit_class_' + group_slot;
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.id = 'outfitting_fit_module_' + group_slot;
		td.className = 'outfitting_fit_module'; // dynamic 'notallowed', 'notenough', 'overlimit'
		var label = document.createElement('label');
		label.className = 'togglebutton';
		label.draggable = true;
		var input = document.createElement('input');
		input.type = 'radio';
		input.id = 'outfitting_slot.' + group + '.' + slot;
		input.name = 'slot';
		input.value = group_slot;
		var div = document.createElement('div');
		var span = document.createElement('span');
		span.id = 'outfitting_fit_name_' + group_slot;
		div.appendChild(span);
		div.insertAdjacentHTML('afterbegin', HTML_ICON['warning']); // dynamically hidden
		label.appendChild(input);
		label.appendChild(div);
		label.htmlFor = input.id;
		label.addEventListener('touchstart', onUIFitSlotsTouchStart);
		td.appendChild(label);
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.className = 'outfitting_fit_mass';
		var span = document.createElement('span');
		span.id = 'outfitting_fit_mass_' + group_slot;
		span.className = ''; // modgood/modbad
		td.appendChild(span);
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.className = 'outfitting_fit_pwrdraw';
		td.id = 'outfitting_fit_power_' + group_slot;
		td.className = ''; // priority#
		var label = document.createElement('label');
		label.className = 'checkbox';
		var input = document.createElement('input');
		input.type = 'checkbox';
		input.id = 'outfitting_fit_powered_' + group_slot;
		input.name = 'powered_' + group_slot;
		input.value = 1;
		input.checked = true;
		label.appendChild(input);
		var div = document.createElement('div');
		var span = document.createElement('span');
		span.className = 'outfitting_fit_pwrdraw';
		var span2 = document.createElement('span');
		span2.id = 'outfitting_fit_pwrdraw_' + group_slot;
		span2.className = ''; // modgood/modbad
		span.appendChild(span2);
		div.appendChild(span);
		div.appendChild(document.createTextNode(' '));
		var divCheck = document.createElement('div');
		divCheck.className = 'check';
		div.appendChild(divCheck);
		label.appendChild(div);
		td.appendChild(label);
		var button = document.createElement('button');
		button.id = 'outfitting_fit_priority_' + group_slot;
		button.name = 'priority_' + group_slot;
		button.className = 'outfitting_fit_priority';
		button.innerHTML = '0';
		td.appendChild(button);
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.id = 'outfitting_fit_attrs_' + group_slot;
		td.className = 'outfitting_fit_attrs';
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.id = 'outfitting_fit_price_' + group_slot;
		td.className = 'outfitting_fit_price';
		tr.appendChild(td);
		
		return tr;
	}; // createUIFitSlotRow()
	
	
	var updateUIFitColumns = function() {
		document.getElementById('outfitting_fit').className = (
			(document.forms.fit.elements.outfitting_show_mass.checked ? '' : 'no') + 'mass ' +
			(document.forms.fit.elements.outfitting_show_power.checked ? '' : 'no') + 'power ' +
			(document.forms.fit.elements.outfitting_show_attrs.checked ? '' : 'no') + 'attrs ' +
			(document.forms.fit.elements.outfitting_show_price.checked ? '' : 'no') + 'price'
		);
	}; // updateUIFitColumns()
	
	
	var updateUIFitHash = function(buildhash) {
		if (current.hashlock)
			return false;
		buildhash = '#/L=' + (buildhash || current.fit.getHash());
		if (cache.feature.history) {
			window.history.replaceState(null, null, buildhash);
		} else {
			window.location.replace(buildhash);
		}
		return true;
	}; // updateUIFitHash()
	
	
	var setCurrentFit = function(fit, namehash) {
		if (!fit || !(fit instanceof Build))
			return false;
		current.fit = fit;
		current.pickerSlot = fit.getDetachedSlot();
		current.tempSlot = fit.getDetachedSlot();
		
		setUIPickerModule();
		updateUIFitStoredBuilds();
		updateUIFitStoredBuildControls(true, namehash);
		document.forms.fit.elements.shipname.value = fit.getName();
		document.forms.fit.elements.shipnametag.value = fit.getNameTag();
		updateUIFitPowerDist();
		updateUIFitShip();
		updateUIFitSlot('ship', 'hull');
		updateUIFitSlot('ship', 'hatch');
		for (var slotgroup in GROUP_LABEL) {
			for (var slotnum = 0;  fit.getSlot(slotgroup, slotnum);  slotnum++) {
				updateUIFitSlot(slotgroup, slotnum);
			}
		}
		updateUIFitLimitedSlots();
		document.forms.stats.elements.stats_cur_fuel.value = fit.getStat('fuelcap');
		document.forms.stats.elements.stats_cur_cargo.value = '0';
		updateUIStats();
		setCurrentSlot('ship', 'hull');
		return true;
	}; // setCurrentFit()
	
	
	var setCurrentFitHash = function(buildhash, namehash) {
		var errors = [];
		var build = Build.fromHash(buildhash, errors);
		var ok = (build && setCurrentFit(build, namehash));
		if (!ok || errors.length > 0) {
			// TODO: pretty popup
			alert(
				(ok ? 'Build hash loaded with errors.' : 'Invalid build hash.') +
				((errors.length > 0) ? ('\n\n* ' + errors.join('\n* ')) : '')
			);
		}
		return ok;
	}; // setCurrentFitHash()
	
	
	var setCurrentFitNameHash = function(namehash) {
		var ok = false;
		if (namehash) {
			var buildhash = current.storedbuild[0][namehash];
			if (!buildhash)
				return false;
			current.hashlock = true;
			ok = setCurrentFitHash(buildhash, namehash);
			current.hashlock = false;
			if (ok)
				updateUIFitHash(buildhash);
		} else {
			var shipid = (current.fit ? current.fit.getShipID() : 1);
			ok = setCurrentFit(new Build(shipid, true), '');
		}
		return ok;
	}; // setCurrentFitNameHash()
	
	
	var processURLHash = function(urlhash, hashlock) {
		var blocks = urlhash.split('/');
		if (blocks[0] !== '#')
			return false;
		for (var b = 1;  b < blocks.length;  b++) {
			switch (blocks[b].slice(0,2)) {
			case 'L=':
				// TODO: support multiple loadouts in the urlhash?
				if (hashlock)
					current.hashlock = true;
				var ok = setCurrentFitHash(blocks[b].slice(2));
				if (hashlock)
					current.hashlock = false;
				if (ok)
					setUIPageTab('outfitting');
				return ok;
				
			case 'I=':
				return importBuild(blocks[b].slice(2));
			}
		}
	}; // processURLHash()
	
	
	var readStoredBuilds = function() {
		if (!cache.feature.storage)
			return false;
		
		current.storedbuild = { 0:{} };
		
		// read non-beta builds first, to copy them into the beta storage; TODO: remove this!
		var item = 'edshipyard_loadouts';
		var data = (window.localStorage.getItem(item) || '').split('/');
		for (var i = 0;  i < data.length;  i++) {
			var entry = data[i].split('=');
			if (entry.length === 2)
				current.storedbuild[0][entry[0]] = entry[1];
		}
		//TODO
		
		var item = 'edshipyard_loadouts' + (current.beta ? '_beta' : '');
		var data = (window.localStorage.getItem(item) || '').split('/');
		for (var i = 0;  i < data.length;  i++) {
			var entry = data[i].split('=');
			if (entry.length === 2)
				current.storedbuild[0][entry[0]] = entry[1];
		}
		
		// pre-parse the build hashes and sort by shipid
		for (var namehash in current.storedbuild[0]) {
			var buildhash = current.storedbuild[0][namehash];
			var shipid = Build.getHashShipID(buildhash);
			if (!current.storedbuild[shipid])
				current.storedbuild[shipid] = {};
			current.storedbuild[shipid][namehash] = buildhash;
		}
		
		return true;
	}; // readStoredBuilds()
	
	
	var writeStoredBuilds = function() {
		if (!cache.feature.storage)
			return false;
		var data = [];
		for (var namehash in current.storedbuild[0]) {
			data.push(namehash + '=' + current.storedbuild[0][namehash]);
		}
		var item = 'edshipyard_loadouts' + (current.beta ? '_beta' : '');
		window.localStorage.setItem(item, data.join('/'));
		return true;
	}; // writeStoredBuilds()
	
	
	var updateUIFitStoredBuilds = function() {
		if (!cache.feature.storage)
			return false;
		
		var shipid = (current.fit ? current.fit.getShipID() : -1);
		var names = [];
		var nameNamehash = {};
		for (var namehash in current.storedbuild[shipid]) {
			var name = hashDecodeS(namehash);
			names.push(name);
			nameNamehash[name] = namehash;
		}
		names.sort();
		
		var select = document.forms.fit.elements.outfitting_fit_stored;
		var curnamehash = select.value;
		var curindex = select.selectedIndex && -1;
		setDOMSelectLength(select, 1 + names.length);
		for (var i = 0;  i < names.length;  i++) {
			select.options[i+1].value = nameNamehash[names[i]];
			select.options[i+1].text = names[i];
			if (nameNamehash[names[i]] === curnamehash)
				curindex = i+1;
		}
		select.selectedIndex = curindex;
		
		return true;
	}; // updateUIFitStoredBuilds()
	
	
	var updateUIFitStoredBuildControls = function(setfit, namehash) {
		var select = document.forms.fit.elements.outfitting_fit_stored;
		if (setfit) {
			if (namehash === undefined) {
				select.selectedIndex = -1;
			} else {
				select.value = namehash;
			}
		} else {
			if (select.selectedIndex === 0)
				select.selectedIndex = -1;
		}
		namehash = select.value;
		var storedbuild = (cache.feature.storage && namehash && current.storedbuild[0][namehash]);
		document.getElementById('outfitting_fit_stored_reload').disabled = (setfit || !storedbuild);
		document.getElementById('outfitting_fit_stored_save').disabled = (setfit || !storedbuild);
		document.getElementById('outfitting_fit_stored_saveas').disabled = (!cache.feature.storage);
		document.getElementById('outfitting_fit_stored_rename').disabled = (!storedbuild);
		document.getElementById('outfitting_fit_stored_delete').disabled = (!storedbuild);
		return true;
	}; // updateUIFitStoredBuildControls()
	
	
	var saveCurrentStoredBuild = function(saveas) {
		if (!cache.feature.storage || !current.fit)
			return false;
		var select = document.forms.fit.elements.outfitting_fit_stored;
		var namehash = select.value;
		var oldnamehash = namehash;
		if (saveas || !namehash) {
			var name = hashDecodeS(namehash) || eddb.ship[current.fit.getShipID()].name;
			do {
				name = prompt("Enter a label to save the current build", name);
				if (name === null)
					return false;
				name = (name || '').trim();
				namehash = hashEncodeS(name);
			} while (!name || (current.storedbuild[0][namehash] && !confirm("A build labeled\n\n    "+name+"\n\nalready exists. Overwrite?")));
		}
		var buildhash = current.fit.getHash();
		var shipid = current.fit.getShipID();
		if (!current.storedbuild[shipid])
			current.storedbuild[shipid] = {};
		current.storedbuild[0][namehash] = buildhash;
		current.storedbuild[shipid][namehash] = buildhash;
		writeStoredBuilds();
		updateUIShipyardStoredBuild(namehash, current.fit);
		if (namehash !== oldnamehash) {
			updateUIFitStoredBuilds();
		}
		updateUIFitStoredBuildControls(true, namehash);
	}; // saveCurrentStoredBuild()
	
	
	var renameStoredBuild = function(namehash) {
		if (!cache.feature.storage || !namehash || !current.storedbuild[0][namehash])
			return false;
		var oldnamehash = namehash;
		var name = hashDecodeS(namehash);
		do {
			name = prompt("Enter a new label for the stored build", name);
			if (name === null)
				return false;
			name = (name || '').trim();
			namehash = hashEncodeS(name);
			if (namehash === oldnamehash)
				return false;
		} while (!name || (current.storedbuild[0][namehash] && !confirm("A build labeled\n\n    "+name+"\n\nalready exists. Overwrite?")));
		var shipid = Build.getHashShipID(current.storedbuild[0][oldnamehash]);
		current.storedbuild[0][namehash] = current.storedbuild[0][oldnamehash];
		current.storedbuild[shipid][namehash] = current.storedbuild[shipid][oldnamehash];
		delete current.storedbuild[0][oldnamehash];
		delete current.storedbuild[shipid][oldnamehash];
		writeStoredBuilds();
		updateUIShipyardStoredBuild(oldnamehash);
		updateUIShipyardStoredBuild(namehash);
		var select = document.forms.fit.elements.outfitting_fit_stored;
		if (select.value === oldnamehash) {
			updateUIFitStoredBuilds();
			select.value = namehash;
		} else {
			updateUIFitStoredBuilds();
		}
	}; // renameStoredBuild()
	
	
	var deleteStoredBuild = function(namehash) {
		if (!cache.feature.storage || !namehash || !current.storedbuild[0][namehash])
			return false;
		var name = hashDecodeS(namehash);
		if (!confirm("The stored build labeled\n\n    "+name+"\n\nwill be deleted. Are you sure?"))
			return false;
		var shipid = Build.getHashShipID(current.storedbuild[0][namehash]);
		delete current.storedbuild[0][namehash];
		delete current.storedbuild[shipid][namehash];
		writeStoredBuilds();
		updateUIShipyardStoredBuild(namehash);
		var select = document.forms.fit.elements.outfitting_fit_stored;
		if (select.value === namehash) {
			updateUIFitStoredBuilds();
			updateUIFitStoredBuildControls(true);
			select.selectedIndex = -1;
		} else {
			updateUIFitStoredBuilds();
		}
	}; // deleteStoredBuild()
	
	
	var updateUIFitShip = function() {
		var shipid = current.fit.getShipID();
		var ship = eddb.ship[shipid];
		
		// get attributes
		var slot = current.fit.getSlot('ship', 'hull');
		var crew = slot.getEffectiveAttrValue('crew');
		var mass = slot.getEffectiveAttrValue('mass');
		var cost = slot.getEffectiveAttrValue('cost');
		var boostcost = slot.getEffectiveAttrValue('boostcost');
		
		// update displays
		document.getElementById('outfitting_fit_crewdist_avl').disabled = (crew < 2);
		document.getElementById('outfitting_fit_crewdist_sys').disabled = (crew < 2);
		document.getElementById('outfitting_fit_crewdist_eng').disabled = (crew < 2);
		document.getElementById('outfitting_fit_crewdist_wep').disabled = (crew < 2);
		document.getElementById('outfitting_fit_class_ship_hull').innerHTML = '?SML'[ship.class || 0];
		
		// mark undersized or reserved modules
		for (var mtype in { ct:1, cpd:1, isg:1,  ifh:2, ipc:2 }) {
			for (var m = 0;  m < cache.mtypeModules[mtype].length;  m++) {
				var modid = cache.mtypeModules[mtype][m];
				var namehashes = Object.keys(current.storedmodule[modid] || EMPTY_OBJ);
				namehashes.push('');
				for (var n = 0;  n < namehashes.length;  n++) {
					var namehash = namehashes[n];
					if (namehash) {
						current.tempSlot.setStoredHash(current.storedmodule[0][namehash]);
					} else {
						current.tempSlot.setModuleID(modid);
					}
					var classname = '';
					switch ((current.tempSlot.getModule() || EMPTY_OBJ).mtype) {
					case 'cpd':
						if (current.tempSlot.getEffectiveAttrValue('engcap') < (boostcost + BOOST_MARGIN))
							classname = 'notenough';
						break;
						
					case 'ct':
					case 'isg':
						if (current.tempSlot.getEffectiveAttrValue('maxmass') < mass)
							classname = 'notenough';
						break;
						
					case 'ifh':
					case 'ipc':
						var module = eddb.module[modid];
						if (module.reserved && !module.reserved[shipid])
							classname = 'notallowed';
						break;
					}
					document.getElementById('outfitting_module.' + modid + '.' + namehash).className = classname;
				}
			}
		}
		
		// create or update slot rows
		for (var slotgroup in GROUP_LABEL) {
			var tbody = document.getElementById('outfitting_fit_' + slotgroup);
			var tr;
			var slotnum = 0;
			while (slotnum < ship.slots[slotgroup].length) {
				var szcls = ship.slots[slotgroup][slotnum];
				if (!(tr = tbody.rows[slotnum + 1])) {
					tbody.appendChild(tr = createUIFitSlotRow(slotgroup, slotnum));
				}
				tr.style.display = '';
				var html = ((slotgroup === 'hardpoint') ? 'USMLH'[szcls || 0] : (szcls || ''));
				if (((ship.reserved || EMPTY_OBJ)[slotgroup] || EMPTY_OBJ)[slotnum]) {
					html = '<abbr title="This slot is restricted to specific module types.">' + html + '*</abbr>';
				}
				document.getElementById('outfitting_fit_class_' + slotgroup + '_' + slotnum).innerHTML = html;
				slotnum++;
			}
			if (slotnum == 0) {
				tbody.style.display = 'none';
			} else {
				tbody.style.display = '';
				while (tr = tbody.rows[++slotnum]) {
					tr.style.display = 'none';
				}
			}
		}
	}; // updateUIFitShip()
	
	
	var updateUIFitPowerDist = function() {
		var maxcrew = (current.fit.getSlot('ship', 'hull').getEffectiveAttrValue('crew') - 1);
		var crew = current.fit.getCrewDist();
		document.getElementById('outfitting_fit_crewdist_avl').className = ('crew' + (maxcrew - crew.sys - crew.eng - crew.wep));
		document.getElementById('outfitting_fit_crewdist_sys').className = ('crew' + crew.sys);
		document.getElementById('outfitting_fit_crewdist_eng').className = ('crew' + crew.eng);
		document.getElementById('outfitting_fit_crewdist_wep').className = ('crew' + crew.wep);
		var dist = current.fit.getEffectivePowerDist();
		document.getElementById('outfitting_fit_powerdist_sys').className = ('crew' + crew.sys + ' dist' + dist.sys);
		document.getElementById('outfitting_fit_powerdist_eng').className = ('crew' + crew.eng + ' dist' + dist.eng);
		document.getElementById('outfitting_fit_powerdist_wep').className = ('crew' + crew.wep + ' dist' + dist.wep);
	}; // updateUIFitPowerDist()
	
	
	var emptyUIFitLimitedSlots = function(slotgroup, slotnum) {
		var slot = current.fit.getSlot(slotgroup, slotnum);
		var limit = slot ? (slot.getModule() || EMPTY_OBJ).limit : null;
		var limitSlots = current.fit.getLimitedSlots();
		if (eddb.limit[limit]) {
			if (limitSlots[limit] && !current.option.experimental) {
				for (var s = limitSlots[limit].length - 1;  s >= 0 && limitSlots[limit].length > eddb.limit[limit];  s--) {
					var slotlim = limitSlots[limit][s];
					if (slotlim.getSlotGroup() != slotgroup || slotlim.getSlotNum() != slotnum) {
						if (slotlim.setModuleID(0)) {
							updateUIFitSlot(slotlim.getSlotGroup(), slotlim.getSlotNum());
							limitSlots[limit].splice(s, 1);
						}
					}
				}
			}
		}
		updateUIFitLimitedSlots(limitSlots);
		return true;
	}; // emptyUIFitLimitedSlots()
	
	
	var updateUIFitLimitedSlots = function(limitSlots) {
		if (!limitSlots)
			limitSlots = current.fit.getLimitedSlots();
		var slot;
		for (var slotgroup in GROUP_LABEL) {
			for (var slotnum = 0;  slot = current.fit.getSlot(slotgroup, slotnum);  slotnum++) {
				var limit = (slot.getModule() || EMPTY_OBJ).limit;
				document.getElementById('outfitting_fit_module_' + slotgroup + '_' + slotnum).classList.toggle('overlimit', (limitSlots[limit] || EMPTY_ARR).length > (eddb.limit[limit] || 99));
			}
		}
	}; // updateUIFitLimitedSlots()
	
	
	var updateUIFitSlot = function(slotgroup, slotnum) {
		var group_slot = slotgroup + '_' + slotnum;
		var slot = current.fit.getSlot(slotgroup, slotnum);
		var modid = slot.getModuleID();
		var el = document.getElementById('outfitting_fit_module_' + group_slot);
		el.classList.toggle('notallowed', !slot.isModuleIDAllowed(modid));
		el.classList.toggle('notenough', !slot.isEnough());
		var label = (group_slot === 'ship_hull') ? eddb.ship[modid].name : (modid ? getModuleLabel(slot.getModule(), false, true) : '');
		document.getElementById('outfitting_fit_name_' + group_slot).innerHTML = ((slot.isModified() ? HTML_ICON['engineer'] : '') + label);
		
		var value = slot.getEffectiveAttrValue('mass') || 0;
		var direction = getAttrModifierDirection('mass', slot.getEffectiveAttrModifier('mass'));
		document.getElementById('outfitting_fit_mass_' + group_slot).innerHTML = (value ? formatAttrHTML('mass', value) : '');
		document.getElementById('outfitting_fit_mass_' + group_slot).className = (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : ''));
		
		document.getElementById('outfitting_fit_power_' + group_slot).className = 'priority' + slot.getPriority();
		var value = slot.getEffectiveAttrValue('pwrdraw') || 0;
		var direction = getAttrModifierDirection('pwrdraw', slot.getEffectiveAttrModifier('pwrdraw'));
		if (value) {
			document.getElementById('outfitting_fit_pwrdraw_' + group_slot).innerHTML = ('-' + formatAttrHTML('pwrdraw', value));
			document.getElementById('outfitting_fit_powered_' + group_slot).disabled = false;
			document.getElementById('outfitting_fit_powered_' + group_slot).checked = slot.getPowered();
			document.getElementById('outfitting_fit_priority_' + group_slot).disabled = false;
			document.getElementById('outfitting_fit_priority_' + group_slot).innerHTML = slot.getPriority();
		} else {
			var value = slot.getEffectiveAttrValue('pwrcap') || 0;
			var direction = getAttrModifierDirection('pwrcap', slot.getEffectiveAttrModifier('pwrcap'));
			document.getElementById('outfitting_fit_powered_' + group_slot).disabled = true;
			document.getElementById('outfitting_fit_pwrdraw_' + group_slot).innerHTML = (value ? ('+' + formatAttrHTML('pwrcap', value)) : '');
			document.getElementById('outfitting_fit_priority_' + group_slot).disabled = true;
		}
		document.getElementById('outfitting_fit_pwrdraw_' + group_slot).className = (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : ''));
		
		var attrs = (group_slot === 'ship_hull') ? ['masslock','crew'] : ((eddb.mtype[(eddb.module[modid] || EMPTY_OBJ).mtype] || EMPTY_OBJ).keyattrs || EMPTY_ARR);
		var hardpoint_attrs = {};
		hardpoint_attrs[document.forms.fit.elements.hardpoint_attr1.value] = true;
		hardpoint_attrs[document.forms.fit.elements.hardpoint_attr2.value] = true;
		var attrhtml = [];
		for (var a = 0;  a < attrs.length;  a++) {
			var attr = attrs[a];
			switch (attr) {
			case 'damage':
				attr = 'dps';
				if (slotgroup === 'hardpoint') {
					if (hardpoint_attrs['sdps']) {
						if (hardpoint_attrs['dps']) {
							var value = slot.getEffectiveAttrValue(attr);
							var direction = getAttrModifierDirection(attr, slot.getEffectiveAttrModifier(attr));
							attrhtml.push(formatAttrLabelHTML(attr) + ' <span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' + formatAttrHTML(attr, value) + '</span>');
						}
						attr = 'sdps';
					} else if (!hardpoint_attrs['dps']) {
						attr = null;
					}
				}
				break;
				
			case 'distdraw':
				attr = 'eps';
				if (slotgroup === 'hardpoint') {
					if (hardpoint_attrs['seps']) {
						if (hardpoint_attrs['eps']) {
							var value = slot.getEffectiveAttrValue(attr);
							var direction = getAttrModifierDirection(attr, slot.getEffectiveAttrModifier(attr));
							attrhtml.push(formatAttrLabelHTML(attr) + ' <span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' + formatAttrHTML(attr, value) + '</span>');
						}
						attr = 'seps';
					} else if (!hardpoint_attrs['eps']) {
						attr = null;
					}
				}
				break;
				
			case 'thmload':
				attr = 'hps';
				if (slotgroup === 'hardpoint') {
					if (hardpoint_attrs['shps']) {
						if (hardpoint_attrs['hps']) {
							var value = slot.getEffectiveAttrValue(attr);
							var direction = getAttrModifierDirection(attr, slot.getEffectiveAttrModifier(attr));
							attrhtml.push(formatAttrLabelHTML(attr) + ' <span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' + formatAttrHTML(attr, value) + '</span>');
						}
						attr = 'shps';
					} else if (!hardpoint_attrs['hps']) {
						attr = null;
					}
				}
				break;
				
			case 'maxrng':
				if (slotgroup !== 'hardpoint' || hardpoint_attrs['maxrng']) {
					var value = slot.getEffectiveAttrValue(attr);
					var value2 = slot.getEffectiveAttrValue('dmgfall');
					if (value && value2) {
						var direction = getAttrModifierDirection(attr, slot.getEffectiveAttrModifier(attr));
						var direction2 = getAttrModifierDirection('dmgfall', slot.getEffectiveAttrModifier('dmgfall'));
						attrhtml.push(
							formatAttrLabelHTML(attr, null, 'Falloff and maximum ranges (in meters)') +
							' <span class="' + (direction2 > 0 ? 'modgood' : (direction2 < 0 ? 'modbad' : '')) + '">' + formatNumHTML(value2) +
							'</span><small class="semantic">/</small><span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' +
							formatAttrHTML(attr, value) + '</span>'
						);
						attr = null;
					} else if (value2) {
						attr = 'dmgfall';
					}
				} else {
					attr = null;
				}
				break;
				
			case 'ammoclip':
			case 'ammomax':
				attr = null;
				if (slotgroup !== 'hardpoint' || hardpoint_attrs['ammoclip'] || hardpoint_attrs['ammomax']) {
					var value = slot.getEffectiveAttrValue('ammoclip');
					var value2 = slot.getEffectiveAttrValue('ammomax');
					if (value && value2) {
						var direction = getAttrModifierDirection('ammomax', slot.getEffectiveAttrModifier('ammomax'));
						var direction2 = getAttrModifierDirection('ammoclip', slot.getEffectiveAttrModifier('ammoclip'));
						attrhtml.push(
							formatAttrLabelHTML('ammomax', null, 'Ammo clip size and maximum reserve ammo') +
							' <span class="' + (direction2 > 0 ? 'modgood' : (direction2 < 0 ? 'modbad' : '')) + '">' + formatNumHTML(value) +
							'</span>+<span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' +
							formatAttrHTML('ammomax', value2) + '</span>'
						);
					} else if (value) {
						attr = 'ammoclip';
					} else if (value2) {
						attr = 'ammomax';
					}
				}
				break;
				
			case 'kinres':
			case 'thmres':
			case 'expres':
				var valueK = slot.getEffectiveAttrValue('kinres');
				var valueT = slot.getEffectiveAttrValue('thmres');
				var valueE = slot.getEffectiveAttrValue('expres');
				var directionK = getAttrModifierDirection('kinres', slot.getEffectiveAttrModifier('kinres'));
				var directionT = getAttrModifierDirection('thmres', slot.getEffectiveAttrModifier('thmres'));
				var directionE = getAttrModifierDirection('expres', slot.getEffectiveAttrModifier('expres'));
				if (valueK || valueT || valueE) {
					attrhtml.push(
						formatAttrLabelHTML(null, 'Res', 'Resistance to kinetic/thermal/explosive damage') +
						' <span class="' + (directionK > 0 ? 'modgood' : (directionK < 0 ? 'modbad' : '')) + '">' + formatNumHTML(valueK, 1) + '</span>' +
						'<small class="semantic">/</small><span class="' + (directionT > 0 ? 'modgood' : (directionT < 0 ? 'modbad' : '')) + '">' + formatNumHTML(valueT, 1) + '</span>' +
						'<small class="semantic">/</small><span class="' + (directionE > 0 ? 'modgood' : (directionE < 0 ? 'modbad' : '')) + '">' + formatNumHTML(valueE, 1) + '</span>' +
						'<small class="semantic">%</small>'
					);
				}
				attr = null;
				break;
				
			case 'shieldrnfps':
			case 'thmdrain':
				var value = slot.getEffectiveAttrValue(attr) * slot.getEffectiveAttrValue('duration');
				var module = slot.getModule();
				var value2 = getModuleAttrValue(module, attr) * getModuleAttrValue(module, 'duration');
				var direction = value - value2;
				if (value) {
					attrhtml.push(formatAttrLabelHTML(attr, null, (attr === 'shieldrnfps' ? 'Total shield recharge' : 'Total thermal drain')) + ' <span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' + formatNumHTML(value, 0) + '</span>');
				}
				attr = null;
				break;
				
			case 'repaircap':
				var value = slot.getEffectiveAttrValue(attr) * slot.getEffectiveAttrValue('repairrtg');
				var module = slot.getModule();
				var value2 = getModuleAttrValue(module, attr) * getModuleAttrValue(module, 'repairrtg');
				var direction = value - value2;
				if (value) {
					attrhtml.push(formatAttrLabelHTML(attr, 'Rep', 'Total repair capacity') + ' <span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' + formatAttrHTML(attr, value) + '</span>');
				}
				attr = null;
				break;
				
			case 'syscap':
			case 'engcap':
			case 'wepcap':
				var valueS = slot.getEffectiveAttrValue('syscap');
				var valueE = slot.getEffectiveAttrValue('engcap');
				var valueW = slot.getEffectiveAttrValue('wepcap');
				var directionS = getAttrModifierDirection('syscap', slot.getEffectiveAttrModifier('syscap'));
				var directionE = getAttrModifierDirection('engcap', slot.getEffectiveAttrModifier('engcap'));
				var directionW = getAttrModifierDirection('wepcap', slot.getEffectiveAttrModifier('wepcap'));
				if (valueS || valueE || valueW) {
					attrhtml.push(
						formatAttrLabelHTML(null, 'Cap', 'System/engine/weapon capacitor capacity (in megawatts) and recharge rate (in megawatts per second)') +
						' <span class="' + (directionS > 0 ? 'modgood' : (directionS < 0 ? 'modbad' : '')) + '">' + formatNumHTML(valueS, 0) + '</span>' +
						'<small class="semantic">/</small><span class="' + (directionE > 0 ? 'modgood' : (directionE < 0 ? 'modbad' : '')) + '">' + formatNumHTML(valueE, 0) + '</span>' +
						'<small class="semantic">/</small><span class="' + (directionW > 0 ? 'modgood' : (directionW < 0 ? 'modbad' : '')) + '">' + formatNumHTML(valueW, 0) + '</span>' +
						'<small class="semantic">MW</small>'
					);
					var valueS = slot.getEffectiveAttrValue('syschg');
					var valueE = slot.getEffectiveAttrValue('engchg');
					var valueW = slot.getEffectiveAttrValue('wepchg');
					var directionS = getAttrModifierDirection('syschg', slot.getEffectiveAttrModifier('syschg'));
					var directionE = getAttrModifierDirection('engchg', slot.getEffectiveAttrModifier('engchg'));
					var directionW = getAttrModifierDirection('wepchg', slot.getEffectiveAttrModifier('wepchg'));
					attrhtml.push(
					//	formatAttrLabelHTML(null, 'Chg', 'System/engine/weapon capacitor recharge rate (in megawatts per second)') +
						' +<span class="' + (directionS > 0 ? 'modgood' : (directionS < 0 ? 'modbad' : '')) + '">' + formatNumHTML(valueS, 1) + '</span>' +
						'<small class="semantic">/</small><span class="' + (directionE > 0 ? 'modgood' : (directionE < 0 ? 'modbad' : '')) + '">' + formatNumHTML(valueE, 1) + '</span>' +
						'<small class="semantic">/</small><span class="' + (directionW > 0 ? 'modgood' : (directionW < 0 ? 'modbad' : '')) + '">' + formatNumHTML(valueW, 1) + '</span>' +
						'<small class="semantic">/s</small>'
					);
				}
				attr = null;
				break;
				
			case 'syschg':
			case 'engchg':
			case 'wepchg':
				attr = null;
				break;
			}
			if (attr) {
				var value = slot.getEffectiveAttrValue(attr);
				if (value) {
					var direction = getAttrModifierDirection(attr, slot.getEffectiveAttrModifier(attr));
					attrhtml.push(formatAttrLabelHTML(attr) + ' <span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' + formatAttrHTML(attr, value) + '</span>');
				}
			}
		}
		document.getElementById('outfitting_fit_attrs_' + group_slot).innerHTML = attrhtml.join(' ');
		
		var el = document.getElementById('outfitting_fit_price_' + group_slot);
		var value = slot.getEffectiveAttrValue('cost') || 0;
		var direction = getAttrModifierDirection('cost', slot.getEffectiveAttrModifier('cost'));
		el.innerHTML = (slot.getBaseAttrValue('cost') ? formatPriceHTML(value) : '');
		el.classList.toggle('modgood', direction > 0);
		el.classList.toggle('modbad', direction < 0);
	}; // updateUIFitSlot()
	
	
	var setCurrentSlot = function(slotgroup, slotnum) {
		current.group = slotgroup;
		current.slot = slotnum;
		var shipid = current.fit.getShipID();
		var ship = eddb.ship[shipid];
		var reserved = ((ship.reserved || EMPTY_OBJ)[slotgroup] || EMPTY_OBJ)[slotnum];
		setUIOutfittingFocus('slot');
		document.getElementById('outfitting_modules_picker').className = (
			slotgroup +
			((slotgroup === 'component') ? (' component_' + CORE_SLOT_ABBR[slotnum]) : '') +
			(GROUP_LABEL[slotgroup] ? (' size' + ship.slots[slotgroup][slotnum]) : ('_' + slotnum)) +
			(reserved ? ' reserved' : '')
		);
		if (reserved) {
			for (var mtype in cache.mtypeModules) {
				document.getElementById('outfitting_modules_mtype_' + mtype).classList.toggle('reserved', reserved[mtype]);
			}
		}
		var slot = current.fit.getSlot(slotgroup, slotnum);
		var modid = slot.getModuleID();
		if (GROUP_LABEL[slotgroup]) {
			setUIPickerModule(modid, '', modid && (current.tab === 'SLOT'));
		} else {
			setUIPickerModule();
		}
		document.forms.fit.elements.slot.value = slotgroup + '_' + slotnum;
		updateUIDetailsStoredModules();
		updateUIDetailsStoredModuleControls(true);
		updateUIDetailsModule();
	}; // setCurrentSlot()
	
	
	var setCurrentFitSlotModule = function(slotgroup, slotnum, modid, namehash, storedhash) {
		var slot = current.fit.getSlot(slotgroup, slotnum);
		var limitOld = (slot.getModule() || EMPTY_OBJ).limit;
		var ok;
		if (namehash || storedhash) {
			ok = slot.setStoredHash(storedhash || current.storedmodule[0][namehash]);
			modid = slot.getModuleID();
		} else {
			ok = slot.setModuleID(modid);
		}
		if (!ok)
			return false;
		var limitNew = (slot.getModule() || EMPTY_OBJ).limit;
		updateUIFitStoredBuildControls();
		updateUIFitSlot(slotgroup, slotnum);
		if (eddb.limit[limitNew]) {
			emptyUIFitLimitedSlots(slotgroup, slotnum);
		} else if (eddb.limit[limitOld]) {
			updateUIFitLimitedSlots();
		}
		updateUIStats();
		setCurrentSlot(slotgroup, slotnum);
		updateUIDetailsStoredModuleControls(true, namehash);
		return true;
	}; // setCurrentFitSlotModule()
	
	
	var swapCurrentFitSlotModules = function(slotgroup1, slotnum1, slotgroup2, slotnum2) {
		if (!current.fit.swapSlots(slotgroup1, slotnum1, slotgroup2, slotnum2))
			return false;
		updateUIFitStoredBuildControls();
		updateUIFitSlot(slotgroup1, slotnum1);
		updateUIFitSlot(slotgroup2, slotnum2);
		updateUIFitLimitedSlots();
		// for most modules the stats don't care which slot they're in, but there is one notable exception
		if ((slotgroup1 === 'component' && slotnum1 === CORE_ABBR_SLOT.FT) || (slotgroup2 === 'component' && slotnum2 === CORE_ABBR_SLOT.FT)) {
			// why does it matter which fuel tank is in the 'core' slot? I don't remember :X
			updateUIStats();
		} else {
			updateUIFitHash();
		}
		setCurrentSlot(slotgroup2, slotnum2);
		return true;
	}; // swapCurrentFitSlotModules()
	
	
	var copyCurrentFitSlotModule = function(slotgroup1, slotnum1, slotgroup2, slotnum2) {
		var limitOld = (current.fit.getSlot(slotgroup2, slotnum2).getModule() || EMPTY_OBJ).limit;
		if (!current.fit.copySlot(slotgroup1, slotnum1, slotgroup2, slotnum2))
			return false;
		var limitNew = (current.fit.getSlot(slotgroup2, slotnum2).getModule() || EMPTY_OBJ).limit;
		updateUIFitStoredBuildControls();
		updateUIFitSlot(slotgroup2, slotnum2);
		if (eddb.limit[limitNew]) {
			emptyUIFitLimitedSlots(slotgroup2, slotnum2);
		} else if (eddb.limit[limitOld]) {
			updateUIFitLimitedSlots();
		}
		updateUIStats();
		setCurrentSlot(slotgroup2, slotnum2);
		return true;
	}; // copyCurrentFitSlotModule()
	
	
	var changeCurrentFitCrewDist = function(to, delta) {
		if (!current.fit.changeCrewDist(to, delta))
			return false;
		updateUIFitStoredBuildControls();
		updateUIFitPowerDist();
		updateUIStats();
		return true;
	}; // changeCurrentFitCrewDist()
	
	
	var resetCurrentFitPowerDist = function() {
		var v = TOTAL_POWER_DIST / 3;
		if (!current.fit.setPowerDist(v,v,v))
			return false;
		updateUIFitStoredBuildControls();
		updateUIFitPowerDist();
		updateUIStats();
		return true;
	}; // resetCurrentFitPowerDist()
	
	
	var changeCurrentFitPowerDist = function(to, delta) {
		if (!current.fit.changePowerDist(to, delta))
			return false;
		updateUIFitStoredBuildControls();
		updateUIFitPowerDist();
		updateUIStats();
		return true;
	}; // changeCurrentFitPowerDist()
	
	
	var setCurrentFitSlotPowered = function(slotgroup, slotnum, powered) {
		if (!current.fit.getSlot(slotgroup, slotnum).setPowered(powered))
			return false;
		updateUIFitStoredBuildControls();
		updateUIFitSlot(slotgroup, slotnum);
		updateUIStats();
		return true;
	}; // setCurrentFitSlotPowered()
	
	
	var changeCurrentFitSlotPriority = function(slotgroup, slotnum, delta) {
		if (!current.fit.getSlot(slotgroup, slotnum).changePriority(delta))
			return false;
		updateUIFitStoredBuildControls();
		updateUIFitSlot(slotgroup, slotnum);
		updateUIStats();
		return true;
	}; // changeCurrentFitSlotPriority()
	
	
	/*
	* DETAILS UI
	*/
	
	
	var initUIDetails = function() {
		var row = document.getElementById('details_discount');
		for (var i = -1;  i < DISCOUNTS.length;  i++) {
			var bit = (1 << (DISCOUNTS.length - i - 1)) + ((i < 0) ? -1 : 0);
			var label = document.createElement('label');
			label.className = 'togglebutton';
			var input = document.createElement('input');
			input.type = 'checkbox';
			input.id = 'discount_' + bit;
			input.name = 'discount';
			input.value = bit;
			var div = document.createElement('div');
			div.innerHTML = (i < 0) ? 'FREE' : formatPctHTML(1 - cache.discountMod[bit], (DISCOUNTS[i] % 1 ? 1 : 0));
			label.appendChild(input);
			label.appendChild(div);
			row.appendChild(label);
		}
		
		var table = document.createElement('table');
		table.id = 'outfitting_details_table';
		
		var tbody = document.createElement('tbody');
		tbody.id = 'outfitting_details_attrs';
		addUIDetailsAttrRow(tbody);
		table.appendChild(tbody);
		
		document.getElementById('outfitting_details_module').appendChild(table);
	}; // initUIDetails()
	
	
	var addUIDetailsAttrRow = function(tbody) {
		tbody = tbody || document.getElementById('outfitting_details_attrs');
		if (!tbody)
			return false;
		
		var r = tbody.rows.length;
		var tr = document.createElement('tr');
		
		var td = document.createElement('td');
		var abbr = document.createElement('abbr');
		abbr.id = 'outfitting_details_abbr_' + r;
		td.appendChild(abbr);
		tr.appendChild(td);
		
		var td = document.createElement('td');
		var div = document.createElement('div');
		div.className = 'outfitting_details_input';
		var input = document.createElement('input');
		input.id = 'outfitting_details_input_' + r;
		input.type = 'text';
		input.size = 4;
		div.appendChild(input);
		td.appendChild(div);
		tr.appendChild(td);
		
		var td = document.createElement('td');
		var span = document.createElement('span');
		span.id = 'outfitting_details_unit_' + r;
		td.appendChild(span);
		tr.appendChild(td);
		
		var td = document.createElement('td');
		var span = document.createElement('span');
		span.id = 'outfitting_details_mod_' + r;
		td.appendChild(span);
		tr.appendChild(td);
		
		tbody.appendChild(tr);
		return true;
	}; // addUIDetailsAttrRow()
	
	
	var readStoredModules = function() {
		if (!cache.feature.storage)
			return false;
		
		current.storedmodule = { 0:{} };
		
		// read non-beta modules first, to copy them into the beta storage; TODO: remove this!
		var item = 'edshipyard_modules';
		var data = (window.localStorage.getItem(item) || '').split('/');
		for (var i = 0;  i < data.length;  i++) {
			var entry = data[i].split('=');
			if (entry.length === 2)
				current.storedmodule[0][entry[0]] = entry[1];
		}
		//TODO
		
		var item = 'edshipyard_modules' + (current.beta ? '_beta' : '');
		var data = (window.localStorage.getItem(item) || '').split('/');
		for (var i = 0;  i < data.length;  i++) {
			var entry = data[i].split('=');
			if (entry.length === 2)
				current.storedmodule[0][entry[0]] = entry[1];
		}
		
		// pre-parse the module hashes and sort by modid
		for (var namehash in current.storedmodule[0]) {
			var modulehash = current.storedmodule[0][namehash];
			var modid = Slot.getStoredHashModuleID(modulehash);
			if (!current.storedmodule[modid])
				current.storedmodule[modid] = {};
			current.storedmodule[modid][namehash] = modulehash;
		}
		
		return true;
	}; // readStoredModules()
	
	
	var writeStoredModules = function() {
		if (!cache.feature.storage)
			return false;
		var data = [];
		for (var namehash in current.storedmodule[0]) {
			data.push(namehash + '=' + current.storedmodule[0][namehash]);
		}
		var item = 'edshipyard_modules' + (current.beta ? '_beta' : '');
		window.localStorage.setItem(item, data.join('/'));
		return true;
	}; // writeStoredModules()
	
	
	var updateUIDetailsStoredModules = function() {
		var select = document.forms.details.elements.outfitting_details_stored;
		var names = [];
		var nameNamehash = {};
		var curnamehash;
		var selectedIndex = -1;
		
		if (current.outfitting_focus === 'module') {
			var tokens = document.forms.modules.elements.module.value.split('.');
			var namehash = tokens[1];
			if (namehash) {
				var name = hashDecodeS(namehash);
				names.push(name);
				nameNamehash[name] = namehash;
				curnamehash = namehash;
			} else {
				selectedIndex = 0;
			}
		} else if (current.outfitting_focus === 'slot') {
			var slot = current.fit.getSlot(current.group, current.slot);
			var modid = slot.getModuleID();
			if (current.group === 'ship') {
				selectedIndex = 0;
			} else if (modid) {
				for (var namehash in current.storedmodule[modid]) {
					var name = hashDecodeS(namehash);
					names.push(name);
					nameNamehash[name] = namehash;
				}
				names.sort();
				curnamehash = select.value;
				selectedIndex = ((slot.getStoredHash() === cache.moduleHash[modid]) ? 0 : -1);
			}
		} else {
			return false;
		}
		
		setDOMSelectLength(select, 1 + names.length);
		for (var i = 0;  i < names.length;  i++) {
			select.options[i+1].value = nameNamehash[names[i]];
			select.options[i+1].text = names[i];
			if (nameNamehash[names[i]] === curnamehash)
				selectedIndex = i+1;
		}
		select.selectedIndex = selectedIndex;
		
		return true;
	}; // updateUIDetailsStoredModules()
	
	
	var updateUIDetailsStoredModuleControls = function(setmodule, namehash) {
		var select = document.forms.details.elements.outfitting_details_stored;
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		var modid = slot.getModuleID();
		var modulehash = slot.getStoredHash();
		var stockhash = cache.moduleHash[modid] || '';
		if (setmodule && namehash) {
			select.value = namehash;
		} else if (setmodule || select.selectedIndex <= 0) {
			select.selectedIndex = ((modid && modulehash === stockhash) ? 0 : -1);
		}
		namehash = select.value || '';
		var storedhash = (namehash ? current.storedmodule[0][namehash] : stockhash);
		
		select.disabled = (current.outfitting_focus === 'module' || current.group === 'ship' || !modid);
		document.getElementById('outfitting_details_stored_reload').disabled = (!namehash || modulehash === storedhash);
		document.getElementById('outfitting_details_stored_save').disabled = (!namehash || modulehash === storedhash)
		document.getElementById('outfitting_details_stored_saveas').disabled = (!modulehash || (current.outfitting_focus === 'slot' && current.group === 'ship'));
		document.getElementById('outfitting_details_stored_rename').disabled = (!namehash);
		document.getElementById('outfitting_details_stored_delete').disabled = (!namehash);
		return true;
	}; // updateUIDetailsStoredModuleControls()
	
	
	var saveCurrentStoredModule = function(saveas) {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		var modid = slot.getModuleID();
		var modulehash = slot.getStoredHash();
		if (!modid || !modulehash)
			return false;
		var select = document.forms.details.elements.outfitting_details_stored;
		var namehash = select.value;
		var oldnamehash = namehash;
		if (saveas || !namehash) {
			var name = hashDecodeS(namehash) || getModuleLabel(slot.getModule());
			do {
				name = prompt("Enter a label to save the current module", name);
				if (name === null)
					return false;
				name = (name || '').trim();
				namehash = hashEncodeS(name);
			} while (!name || (current.storedmodule[0][namehash] && !confirm("A module labeled\n\n    "+name+"\n\nalready exists. Overwrite?")));
		}
		if (!current.storedmodule[modid])
			current.storedmodule[modid] = {};
		current.storedmodule[0][namehash] = modulehash;
		current.storedmodule[modid][namehash] = modulehash;
		writeStoredModules();
		if (namehash !== oldnamehash) {
			updateUIModulePickerStoredModules();
			if (current.outfitting_focus === 'module') {
				setUIPickerModule(modid, namehash, true);
			}
			updateUIDetailsStoredModules();
		}
		updateUIDetailsStoredModuleControls(true, namehash);
		return true;
	}; // saveCurrentStoredModule()
	
	
	var renameStoredModule = function(namehash) {
		if (!namehash || !current.storedmodule[0][namehash])
			return false;
		var oldnamehash = namehash;
		var name = hashDecodeS(namehash);
		do {
			name = prompt("Enter a new label for the stored module", name);
			if (name === null)
				return false;
			name = (name || '').trim();
			namehash = hashEncodeS(name);
			if (namehash === oldnamehash)
				return false;
		} while (!name || (current.storedmodule[0][namehash] && !confirm("A module labeled\n\n    "+name+"\n\nalready exists. Overwrite?")));
		var modid = Slot.getStoredHashModuleID(current.storedmodule[0][oldnamehash]);
		current.storedmodule[0][namehash] = current.storedmodule[0][oldnamehash];
		current.storedmodule[modid][namehash] = current.storedmodule[modid][oldnamehash];
		delete current.storedmodule[0][oldnamehash];
		delete current.storedmodule[modid][oldnamehash];
		writeStoredModules();
		updateUIModulePickerStoredModules();
		var select = document.forms.details.elements.outfitting_details_stored;
		if (select.value === oldnamehash) {
			if (current.outfitting_focus === 'module') {
				setUIPickerModule(modid, namehash, true);
			}
			updateUIDetailsStoredModules();
			select.value = namehash;
		} else {
			updateUIDetailsStoredModules();
		}
	}; // renameStoredModule()
	
	
	var deleteStoredModule = function(namehash) {
		if (!namehash || !current.storedmodule[0][namehash])
			return false;
		var name = hashDecodeS(namehash);
		if (!confirm("The stored module labeled\n\n    "+name+"\n\nwill be deleted. Are you sure?"))
			return false;
		var modid = Slot.getStoredHashModuleID(current.storedmodule[0][namehash]);
		delete current.storedmodule[0][namehash];
		delete current.storedmodule[modid][namehash];
		writeStoredModules();
		updateUIModulePickerStoredModules();
		var select = document.forms.details.elements.outfitting_details_stored;
		if (select.value === namehash) {
			updateUIDetailsStoredModules();
			updateUIDetailsStoredModuleControls(true);
		} else {
			updateUIDetailsStoredModules();
		}
	}; // deleteStoredModule()
	
	
	var setUIDetailsNameHash = function(namehash) {
		if (current.outfitting_focus === 'slot') {
			if (namehash)
				return setCurrentFitSlotModule(current.group, current.slot, 0, namehash);
			var modid = current.fit.getSlot(current.group, current.slot).getModuleID();
			return setCurrentFitSlotModule(current.group, current.slot, modid);
		}
		
		var slot = current.pickerSlot;
		var ok;
		if (namehash) {
			ok = slot.setStoredHash(current.storedmodule[0][namehash]);
		} else {
			var modid = slot.getModuleID();
			ok = slot.setModuleID(modid);
		}
		if (!ok)
			return false;
		updateUIDetailsStoredModules();
		updateUIDetailsStoredModuleControls(true, namehash);
		updateUIDetailsModule();
		return true;
	}; // setUIDetailsNameHash()
	
	
	var updateUIDetailsModule = function() {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		var modid = slot.getModuleID();
		var module = slot.getModule();
		
		document.getElementById('outfitting_details_module').style.visibility = (module ? 'visible' : 'hidden');
		if (!module)
			return true;
		
		// set displayed label
		document.getElementById('outfitting_details_label').innerHTML = (module.mtype ? getModuleLabel(module, false, true) : module.name);
		
		// rebuild blueprint selector
		var select = document.forms.details.elements.blueprint;
		var idlist = cache.mtypeBlueprints[module.mtype];
		var iddata = eddb.blueprint;
		for (var i = 0, o = 1;  idlist && i < idlist.length;  i++) {
			if (iddata[idlist[i]]) {
				while (select.options.length <= o)
					select.options.add(document.createElement('option'));
				select.options[o].value = idlist[i];
				select.options[o].text = iddata[idlist[i]].name;
				select.options[o].disabled = (module.noblueprints && (module.noblueprints['*'] || module.noblueprints[idlist[i]]))
				o++;
			}
		}
		while (select.options.length > o)
			select.options.remove(select.options.length - 1);
		
		// rebuild experimental selector
		var select = document.forms.details.elements.expeffect;
		var idlist = cache.mtypeExpeffects[module.mtype];
		var iddata = eddb.expeffect;
		for (var i = 0, o = 1;  idlist && i < idlist.length;  i++) {
			if (iddata[idlist[i]]) {
				while (select.options.length <= o)
					select.options.add(document.createElement('option'));
				select.options[o].value = idlist[i];
				select.options[o].text = iddata[idlist[i]].name;
				select.options[o].disabled = (module.noexpeffects && (module.noexpeffects['*'] || module.noexpeffects[idlist[i]]))
				o++;
			}
		}
		while (select.options.length > o)
			select.options.remove(select.options.length - 1);
		
		// rebuild attribute rows
		var attrs = getModuleAttrs(module);
		var tbody = document.getElementById('outfitting_details_attrs');
		while (tbody.rows.length < attrs.length) {
			addUIDetailsAttrRow();
		}
		for (var r = 0;  r < attrs.length;  r++) {
			var attr = attrs[r];
			var attribute = eddb.attribute[attr];
			
			var abbr = document.getElementById('outfitting_details_abbr_' + r);
			abbr.innerHTML = attribute.name;
			abbr.title = (attribute.desc || '');
			
			var input = document.getElementById('outfitting_details_input_' + r);
			input.name = attr;
			
			var unit = document.getElementById('outfitting_details_unit_' + r);
			unit.innerHTML = (attribute.unit || '');
			
			tbody.rows[r].style.display = '';
		}
		for (var r = attrs.length;  r < tbody.rows.length;  r++) {
			document.getElementById('outfitting_details_input_' + r).name = '_disabled_' + r;
			tbody.rows[r].style.display = 'none';
		}
		
		// set displayed discounts and modification data
		updateUIDetailsDiscounts();
		updateUIDetailsModifications();
		return true;
	}; // updateUIDetailsModule()
	
	
	var updateUIDetailsDiscounts = function() {
		var slot = current.fit.getSlot(current.group, current.slot);
		var discounts = (current.outfitting_focus === 'slot') ? slot.getDiscounts() : 0;
		var disabled = (current.outfitting_focus === 'slot') ? (slot.getBaseAttrValue('cost') < 1) : true;
		var inputs = document.getElementById('details_discount').getElementsByTagName('INPUT');
		for (var i = 0;  i < inputs.length;  i++) {
			inputs[i].checked = ((discounts & inputs[i].value) == inputs[i].value) && ((discounts == 0x3F) == (inputs[i].value == 0x3F));
			inputs[i].disabled = disabled;
		}
	}; // updateUIDetailsDiscounts()
	
	
	var setUIDetailsDiscount = function(discount, checked) {
		if (current.outfitting_focus !== 'slot')
			return false;
		var slot = current.fit.getSlot(current.group, current.slot);
		var discounts = slot.getDiscounts();
		if (checked) {
			discounts = (((discounts == 0x3F) ? 0 : discounts) | discount);
		} else {
			discounts = (discounts & ~discount);
		}
		if (!slot.setDiscounts(discounts))
			return false;
		updateUIFitStoredBuildControls();
		updateUIFitSlot(current.group, current.slot);
		updateUIStats();
		updateUIDetailsDiscounts();
		updateUIDetailsModifications(); // just to redraw cost
		return true;
	}; // setUIDetailsDiscount()
	
	
	var updateUIDetailsModifications = function() {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		var mtypeid = slot.getModuleMtype();
		var modifiable = slot.isModifiable();
		var modified = slot.isModified();
		var bpid = slot.getBlueprintID();
		var bpgrade = slot.getBlueprintGrade();
		var bproll = slot.getBlueprintRoll();
		var expid = slot.getExpeffectID();
		
		var select = document.forms.details.elements.blueprint;
		select.disabled = !((modifiable && cache.mtypeBlueprints[mtypeid]) || bpid);
		if (cache.mtypeBlueprints[mtypeid]) {
			select.value = (bpid || '');
		} else {
			select.selectedIndex = -1;
		}
		
		var select = document.forms.details.elements.expeffect;
		select.disabled = !((modifiable && cache.mtypeExpeffects[mtypeid] && (bpid || current.option.experimental)) || expid);
		if (cache.mtypeExpeffects[mtypeid]) {
			select.value = (expid || '');
		} else {
			select.selectedIndex = -1;
		}
		document.getElementById('details_expeffect').innerHTML = ((eddb.expeffect[expid] || EMPTY_OBJ).special || '');
		
		var maxgrade = (bpid ? eddb.blueprint[bpid].maxgrade : 0);
		for (var g = 1;  g <= MAX_BLUEPRINT_GRADE;  g++) {
			document.getElementById('blueprint_grade_' + g).disabled = (g > maxgrade);
		}
		document.forms.details.elements.blueprint_grade.value = bpgrade.toFixed(0);
		
		var inputs = document.getElementById('details_select_expeffect').getElementsByTagName('INPUT');
		for (var i = 0;  i < inputs.length;  i++) {
			inputs[i].disabled = !(bpid || modified);
		}
		document.forms.details.elements.blueprint_roll.value = bproll.toFixed(1);
		
		var module = slot.getModule();
		if (module) {
			var input;
			for (var r = 0;  (input = document.getElementById('outfitting_details_input_' + r)) && eddb.attribute[input.name];  r++) {
				var attr = input.name;
				var modifier = slot.getEffectiveAttrModifier(attr);
				var direction = getAttrModifierDirection(attr, modifier);
				var value = getModuleAttrValue(module, attr, modifier);
				/* TODO: ship rank? the Fed names are too long :/
				if (attr === 'rank' && value < (eddb.rank[module.faction] || EMPTY_ARR).length) {
					value = eddb.rank[module.faction][value];
				}
				*/
				input.value = getModuleAttrValueText(module, attr, value);
				input.size = max(input.value.length, 3);
				input.disabled = !((modifiable && (isModuleAttrModifiable(module, attr) || ((attr === 'rof') && isModuleAttrModifiable(module, 'bstint')) || (attr === 'cost' && slot.getBaseAttrValue('cost'))) && (bpid || current.option.experimental)) || modifier);
				var moddisplay = document.getElementById('outfitting_details_mod_' + r);
				moddisplay.className = (direction ? ((direction < 0) ? 'modbad' : 'modgood') : '');
				moddisplay.innerHTML = getModuleAttrModifierText(module, attr, modifier);
			}
		}
		return true;
	}; // updateUIDetailsModifications()
	
	
	var setUIDetailsBlueprintID = function(bpid) {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		if (!((slot.getBlueprintID() && bpid) ? slot.setBlueprintID(bpid) : slot.setBlueprint(bpid, MAX_BLUEPRINT_GRADE, (bpid || !current.option.experimental) ? 1.0 : null)))
			return false;
		if (!bpid && !current.option.experimental)
			slot.setExpeffectID('');
		if (current.outfitting_focus === 'slot') {
			updateUIFitStoredBuildControls();
			updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		}
		updateUIDetailsStoredModuleControls();
		updateUIDetailsModifications();
		return true;
	}; // setUIDetailsBlueprintID()
	
	
	var setUIDetailsBlueprintGrade = function(bpgrade) {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		if (!slot.setBlueprintGrade(bpgrade))
			return false;
		if (current.outfitting_focus === 'slot') {
			updateUIFitStoredBuildControls();
			updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		}
		updateUIDetailsStoredModuleControls();
		updateUIDetailsModifications();
		return true;
	}; // setUIDetailsBlueprintGrade()
	
	
	var setUIDetailsBlueprintRoll = function(bproll) {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		if (!slot.setBlueprintRoll(bproll))
			return false;
		if (current.outfitting_focus === 'slot') {
			updateUIFitStoredBuildControls();
			updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		}
		updateUIDetailsStoredModuleControls();
		updateUIDetailsModifications();
		return true;
	}; // setUIDetailsBlueprintRoll()
	
	
	var setUIDetailsExpeffect = function(expid) {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		if (!slot.setExpeffectID(expid))
			return false;
		if (current.outfitting_focus === 'slot') {
			updateUIFitStoredBuildControls();
			updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		}
		updateUIDetailsStoredModuleControls();
		updateUIDetailsModifications();
		return true;
	}; // setUIDetailsExpeffect()
	
	
	var setUIDetailsAttrText = function(attr, text) {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		var module = slot.getModule();
		var attribute = eddb.attribute[attr];
		if (!module || !attribute)
			return false;
		text = text.trim();
		if (text === '') {
			if (!slot.setAttrModifier(attr))
				return false;
		} else {
			if (text.slice(-1) === '%' && (attribute.unit !== '%' || text[0] === '+' || text[0] === '-')) {
				var modifier = parseModuleAttrModifierText(module, attr, text);
			} else {
				var modifier = getModuleAttrModifier(module, attr, parseFloat(text));
			}
			if (!slot.setEffectiveAttrModifier(attr, modifier))
				return false;
		}
		if (current.outfitting_focus === 'slot') {
			updateUIFitStoredBuildControls();
			updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		}
		updateUIDetailsStoredModuleControls();
		updateUIDetailsDiscounts();
		updateUIDetailsModifications();
		return true;
	}; // setUIDetailsAttrText()
	
	
	/*
	* STATS UI
	*/
	
	
	var setStatsCurFuel = function(value) {
		value = min(max(value, 0), current.fit.getStat('fuelcap'));
		document.forms.stats.elements.stats_cur_fuel.value = value;
		updateUIStats();
	}; // setStatsCurFuel()
	
	
	var setStatsCurCargo = function(value) {
		value = min(max((value + 0.5) | 0, 0), current.fit.getStat('cargocap'));
		document.forms.stats.elements.stats_cur_cargo.value = value;
		updateUIStats();
	}; // setStatsCurCargo()
	
	
	var updateUIStatsPanels = function(enabledPanel) {
		var space = document.getElementById('outfitting_stats_wrapper').clientWidth * 0.95;
		var next = 0;
		var panels = [];
		var panelOrder = {};
		var panelWidth = {};
		var input, panel;
		for (var p = 1;  (input = document.getElementById('stats_toggle_' + p)) && (panel = document.getElementById('outfitting_stats_' + p));  p++) {
			if (input.checked) {
				panels.push(p);
				panelOrder[p] = parseInt(input.value);
				panelWidth[p] = panel.offsetWidth;
				next = max(next, panelOrder[p]);
			}
			space -= panel.offsetWidth;
		}
		if (enabledPanel) {
			next++;
			panelOrder[enabledPanel] = next;
			document.getElementById('stats_toggle_' + enabledPanel).value = next;
		}
		if (space < 0) {
			panels.sort(function(p1,p2) { return panelOrder[p2] - panelOrder[p1]; });
			while (space < 0 && panels.length > 1) {
				var p = panels.pop();
				document.getElementById('stats_toggle_' + p).checked = false;
				space += panelWidth[p];
			}
		}
	}; // updateUIStatsPanels()
	
	
	var updateUIStats = function() {
		// TODO: insurance
		
		// mark undersized fitted thruster
		var massBase = current.fit.getStat('mass') + current.fit.getStat('fuelcap') + current.fit.getStat('cargocap');
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.TH);
		document.getElementById('outfitting_fit_module_component_' + CORE_ABBR_SLOT.TH).classList.toggle('notenough', slot.getEffectiveAttrValue('maxmass') < massBase);
		document.getElementById('outfitting_stats_max_mass').classList.toggle('error', slot.getEffectiveAttrValue('maxmass') < massBase);
		massBase -= slot.getEffectiveAttrValue('mass');
		
		// mark undersized thruster options
		for (var m = 0;  m < cache.mtypeModules['ct'].length;  m++) {
			var modid = cache.mtypeModules['ct'][m];
			var namehashes = Object.keys(current.storedmodule[modid] || EMPTY_OBJ);
			namehashes.push('');
			for (var n = 0;  n < namehashes.length;  n++) {
				var namehash = namehashes[n];
				if (namehash) {
					current.tempSlot.setStoredHash(current.storedmodule[0][namehash]);
				} else {
					current.tempSlot.setModuleID(modid);
				}
				var classname = '';
				if (current.tempSlot.getEffectiveAttrValue('maxmass') < (massBase + current.tempSlot.getEffectiveAttrValue('mass')))
					classname = 'notenough';
				document.getElementById('outfitting_module.' + modid + '.' + namehash).className = classname;
			}
		}
		
		updateUIStatsTotals();
		updateUIStatsPower();
		updateUIStatsNavFSD();
		updateUIStatsNavThr();
		updateUIStatsThm();
		updateUIStatsShd();
		updateUIStatsArm();
		updateUIStatsWpn();
		
		updateUIFitHash();
	}; // updateUIStats()
	
	
	var updateUIStatsTotals = function() {
		// get primary stats
		var fuelres = eddb.ship[current.fit.getShipID()].fuelreserve;
		var cost = current.fit.getStat('cost');
		var mass = current.fit.getStat('mass');
		var fuelcap = current.fit.getStat('fuelcap');
		var cargocap = current.fit.getStat('cargocap');
		var cabincap = current.fit.getStat('cabincap');
		
		// compute derived stats
		var curTtlFuel = min(max(parseFloat(document.forms.stats.elements.stats_cur_fuel.value) || 0, 0), fuelcap) + fuelres;
		var curTtlCrgo = min(max(parseFloat(document.forms.stats.elements.stats_cur_cargo.value) || 0, 0), cargocap);
		var curTtlMass = mass + curTtlFuel + curTtlCrgo;
		var maxTtlMass = mass + fuelcap + cargocap;
		
		// update displays
		document.getElementById('outfitting_stats_cur_mass').innerHTML = formatAttrHTML('mass', curTtlMass, 1);
		document.getElementById('outfitting_stats_max_mass').innerHTML = formatAttrHTML('mass', maxTtlMass, 1);
		document.getElementById('outfitting_stats_max_fuel').innerHTML = formatAttrHTML('fuelcap', fuelcap, 0);
		document.getElementById('outfitting_stats_max_cargo').innerHTML = formatAttrHTML('cargocap', cargocap, 0);
		document.getElementById('outfitting_stats_max_psgr').innerHTML = formatAttrHTML('cabincap', cabincap, 0);
		
		// TODO: prices in a separate function
		var htmlNA = '<small class="semantic">N/A</small>';
		var cost_vehicle = current.fit.getStat('cost_vehicle');
		var cost_restock = current.fit.getStat('cost_restock');
		var cost_rearm = current.fit.getStat('cost_rearm');
		var cost_rebuy = cost * 0.05;
		document.getElementById('outfitting_prc_fuel').innerHTML = formatPriceHTML(eddb.ship[current.fit.getShipID()].fuelcost * fuelcap, false);
		document.getElementById('outfitting_prc_vehicle').innerHTML = (!cost_vehicle ? htmlNA : formatPriceHTML(cost_vehicle, false));
		document.getElementById('outfitting_prc_misc').innerHTML = (!cost_restock ? htmlNA : formatPriceHTML(cost_restock, false));
		document.getElementById('outfitting_prc_ammo').innerHTML = (!cost_rearm ? htmlNA : formatPriceHTML(cost_rearm, false));
		document.getElementById('outfitting_stats_rebuy').innerHTML = formatPriceHTML(cost_rebuy, cost_rebuy > 999999);
		document.getElementById('outfitting_stats_price').innerHTML = formatPriceHTML(cost, cost > 999999);
	}; // updateUIStatsTotals()
	
	
	var updateUIStatsPower = function() {
		// get primary stats
		var pwrcap = current.fit.getStat('pwrcap');
		var pwrdraw_ret = current.fit.getStat('pwrdraw_ret');
		var pwrdraw_dep = current.fit.getStat('pwrdraw_dep');
		
		// update displays
		var classes = '';
		var pwrdraw_ret_ttl = 0;
		var pwrdraw_dep_ttl = 0;
		for (var p = 1;  p <= MAX_POWER_PRIORITY;  p++) {
			pwrdraw_ret_ttl += pwrdraw_ret[p];
			var width = (90.0 * pwrdraw_ret[p] / pwrcap);
			var abbr = document.getElementById('outfitting_stats_power_ret_' + p);
			abbr.title = (formatNumText(pwrdraw_ret_ttl, 2) + ' / ' + formatNumText(pwrcap, 2) + ' MW (' + formatPctText(pwrdraw_ret_ttl / pwrcap, 1) + ')');
			abbr.style.display = (width > 0.0) ? '' : 'none';
			abbr.style.width = width.toFixed(3) + '%';
			abbr.className = ((pwrdraw_ret_ttl > pwrcap) ? 'error' : (pwrdraw_ret_ttl > MAX_DAMAGED_PWRCAP * pwrcap) ? '' : 'okay');
			
			pwrdraw_dep_ttl += pwrdraw_dep[p];
			var width = (90.0 * pwrdraw_dep[p] / pwrcap);
			var abbr = document.getElementById('outfitting_stats_power_dep_' + p);
			abbr.title = (formatNumText(pwrdraw_dep_ttl, 2) + ' / ' + formatNumText(pwrcap, 2) + ' MW (' + formatPctText(pwrdraw_dep_ttl / pwrcap, 1) + ')');
			abbr.style.display = (width > 0.0) ? '' : 'none';
			abbr.style.width = width.toFixed(3) + '%';
			abbr.className = ((pwrdraw_dep_ttl > pwrcap) ? 'error' : (pwrdraw_dep_ttl > MAX_DAMAGED_PWRCAP * pwrcap) ? '' : 'okay');
			
			if (pwrdraw_ret_ttl > pwrcap) {
				classes += ' priority' + p + 'error';
			} else if (pwrdraw_dep_ttl > pwrcap) {
				classes += ' priority' + p + 'warning';
			} else if (pwrdraw_ret_ttl <= MAX_DAMAGED_PWRCAP * pwrcap) {
				classes += ' priority' + p + 'okay';
			}
		}
		document.getElementById('outfitting_fit_slots').className = classes.substring(1);
		/* TODO: powerdist in fit
		document.getElementById('outfitting_stats_power_ret').innerHTML = (formatNumHTML(pwrdraw_ret[0], 2) + ' <small class="semantic">/</small> ' + formatAttrHTML('pwrcap', pwrcap, 2) + ' (' + formatPctHTML(pwrdraw_ret[0] / pwrcap, 1) + ')');
		document.getElementById('outfitting_stats_power_ret').className = ((pwrdraw_ret[0] > pwrcap) ? 'error' : '');
		document.getElementById('outfitting_stats_power_dep').innerHTML = (formatNumHTML(pwrdraw_dep[0], 2) + ' <small class="semantic">/</small> ' + formatAttrHTML('pwrcap', pwrcap, 2) + ' (' + formatPctHTML(pwrdraw_dep[0] / pwrcap, 1) + ')');
		document.getElementById('outfitting_stats_power_dep').className = ((pwrdraw_dep[0] > pwrcap) ? 'error' : '');
		*/
		document.getElementById('outfitting_stats_power_ret').innerHTML = ('<abbr class="' + ((pwrdraw_ret[0] > pwrcap) ? 'error' : '') + '" title="' + formatNumText(pwrdraw_ret[0], 2) + ' / ' + formatNumText(pwrcap, 2) + ' MW">' + formatPctHTML(pwrdraw_ret[0] / pwrcap, 1) + '</abbr>');
		document.getElementById('outfitting_stats_power_dep').innerHTML = ('<abbr class="' + ((pwrdraw_dep[0] > pwrcap) ? 'error' : '') + '" title="' + formatNumText(pwrdraw_dep[0], 2) + ' / ' + formatNumText(pwrcap, 2) + ' MW">' + formatPctHTML(pwrdraw_dep[0] / pwrcap, 1) + '</abbr>');
	}; // updateUIStatsPower()
	
	
	var updateUIStatsNavFSD = function() {
		// get primary stats
		var fuelres = eddb.ship[current.fit.getShipID()].fuelreserve;
		var mass = current.fit.getStat('mass');
		var jumpbst = current.fit.getStat('jumpbst');
		var fuelcap = current.fit.getStat('fuelcap');
		var cargocap = current.fit.getStat('cargocap');
		var scooprate = current.fit.getStat('scooprate');
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.FD);
		var optmass = slot.getEffectiveAttrValue('optmass');
		var maxfuel = slot.getEffectiveAttrValue('maxfuel');
		var fuelmul = slot.getEffectiveAttrValue('fuelmul');
		var fuelpower = slot.getEffectiveAttrValue('fuelpower');
		
		// get or compute derived stats
		var curTtlFuel = min(max(parseFloat(document.forms.stats.elements.stats_cur_fuel.value) || 0, 0), fuelcap);
		var curTtlCrgo = min(max(parseFloat(document.forms.stats.elements.stats_cur_cargo.value) || 0, 0), cargocap);
		var ldnNavJmp = current.fit.getStat('_jump_laden');
		var unlNavJmp = current.fit.getStat('_jump_unladen');
		var curNavJmp = getJumpDistance(         mass + curTtlFuel + fuelres + curTtlCrgo, min(curTtlFuel, maxfuel), optmass, fuelmul, fuelpower, jumpbst);
		var maxNavJmp = getJumpDistance(         mass + min(fuelcap, maxfuel)            , min(fuelcap   , maxfuel), optmass, fuelmul, fuelpower, jumpbst);
		var curNavRng = getJumpRange(curTtlFuel, mass + curTtlFuel           + curTtlCrgo, min(curTtlFuel, maxfuel), optmass, fuelmul, fuelpower, jumpbst);
		var ldnNavRng = current.fit.getStat('_range_laden');
		var unlNavRng = current.fit.getStat('_range_unladen');
		var scpNavJmp = min(curTtlFuel, maxfuel) / scooprate;
		var scpNavRng = fuelcap / scooprate;
		
		// update displays
		var htmlNA = '<small class="semantic">N/A</small>';
		document.getElementById('outfitting_stats_cur_jump'    ).innerHTML = formatNumHTML(curNavJmp, 2) + '<small>LY</small>';
		document.getElementById('outfitting_stats_laden_jump'  ).innerHTML = formatNumHTML(ldnNavJmp, 2) + '<small>LY</small>';
		document.getElementById('outfitting_stats_unladen_jump').innerHTML = formatNumHTML(unlNavJmp, 2) + '<small>LY</small>';
		document.getElementById('outfitting_stats_max_jump'    ).innerHTML = formatNumHTML(maxNavJmp, 2) + '<small>LY</small>';
		document.getElementById('outfitting_stats_cur_range'    ).innerHTML = formatNumHTML(curNavRng, 2) + '<small>LY</small>';
		document.getElementById('outfitting_stats_laden_range'  ).innerHTML = formatNumHTML(ldnNavRng, 2) + '<small>LY</small>';
		document.getElementById('outfitting_stats_unladen_range').innerHTML = formatNumHTML(unlNavRng, 2) + '<small>LY</small>';
		document.getElementById('outfitting_stats_scoop_jump' ).innerHTML = (scooprate ? formatTimeHTML(scpNavJmp, true) : htmlNA);
		document.getElementById('outfitting_stats_scoop_range').innerHTML = (scooprate ? formatTimeHTML(scpNavRng, true) : htmlNA);
		document.getElementById('outfitting_stats_scoop_speed').innerHTML = (scooprate ? formatAttrHTML('scooprate', scooprate) : htmlNA);
	}; // updateUIStatsNavFSD()
	
	
	var updateUIStatsNavThr = function() {
		// get primary stats
		var fuelres = eddb.ship[current.fit.getShipID()].fuelreserve;
		var mass = current.fit.getStat('mass');
		var fuelcap = current.fit.getStat('fuelcap');
		var cargocap = current.fit.getStat('cargocap');
		var powerdist_eng = current.fit.getEffectivePowerDist('eng');
		
		var slot = current.fit.getSlot('ship', 'hull');
		var minthrust = slot.getEffectiveAttrValue('minthrust') / 100.0;
		var boostcost = slot.getEffectiveAttrValue('boostcost');
		var topspd = slot.getEffectiveAttrValue('topspd');
		var bstspd = slot.getEffectiveAttrValue('bstspd');
		var pitch = slot.getEffectiveAttrValue('pitch');
		var roll = slot.getEffectiveAttrValue('roll');
		var yaw = slot.getEffectiveAttrValue('yaw');
		var minpitch = slot.getEffectiveAttrValue('minpitch');
		var minroll = slot.getEffectiveAttrValue('minroll');
		var minyaw = slot.getEffectiveAttrValue('minyaw');
		
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.PD);
		var engcap = slot.getEffectiveAttrValue('engcap');
		var engchg = slot.getEffectiveAttrValue('engchg');
		
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.TH);
		var minmass = slot.getEffectiveAttrValue('minmass');
		var optmass = slot.getEffectiveAttrValue('optmass');
		var maxmass = slot.getEffectiveAttrValue('maxmass');
		var minmulspd = slot.getEffectiveAttrValue('minmulspd');
		var optmulspd = slot.getEffectiveAttrValue('optmulspd');
		var maxmulspd = slot.getEffectiveAttrValue('maxmulspd');
		var minmulrot = slot.getEffectiveAttrValue('minmulrot');
		var optmulrot = slot.getEffectiveAttrValue('optmulrot');
		var maxmulrot = slot.getEffectiveAttrValue('maxmulrot');
		
		// compute derived stats
		var curTtlFuel = min(max(parseFloat(document.forms.stats.elements.stats_cur_fuel.value) || 0, 0), fuelcap) + fuelres;
		var curTtlCrgo = min(max(parseFloat(document.forms.stats.elements.stats_cur_cargo.value) || 0, 0), cargocap);
		var powerdistEngMul = powerdist_eng / MAX_POWER_DIST;
		var curNavSpdMul = getMassCurveMultiplier(mass + curTtlFuel + curTtlCrgo, minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd) / 100;
		var ldnNavSpdMul = getMassCurveMultiplier(mass + fuelcap    + cargocap  , minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd) / 100;
		var unlNavSpdMul = getMassCurveMultiplier(mass + fuelcap                , minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd) / 100;
		var maxNavSpdMul = getMassCurveMultiplier(mass                          , minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd) / 100;
		var engcapEnough = (engcap > boostcost + BOOST_MARGIN);
		var curNavFrq = (boostcost / (engchg * pow(powerdist_eng / MAX_POWER_DIST, 1.1)));
		var maxNavFrq = (boostcost / engchg);
		var curHndRotMul = getMassCurveMultiplier(mass + curTtlFuel + curTtlCrgo, minmass, optmass, maxmass, minmulrot, optmulrot, maxmulrot) / 100;
		var maxHndRotMul = getMassCurveMultiplier(mass                          , minmass, optmass, maxmass, minmulrot, optmulrot, maxmulrot) / 100;
		
		// update nav displays
		var htmlErrorTH = '<abbr class="error" title="Thruster has insufficient maximum mass">ERR</abbr>';
		var htmlErrorPD = '<abbr class="error" title="Power distributor has insufficient ENG capacitor to boost">ERR</abbr>';
		var htmlBoost5 = '<abbr class="" title="Can boost as often as possible"><small class="semantic">&lt; </small>5<small class="semantic">s</small></abbr>';
		document.getElementById('outfitting_stats_cur_speed'    ).innerHTML = (isNaN(curNavSpdMul) ? htmlErrorTH : formatAttrHTML('topspd', curNavSpdMul * topspd * (powerdistEngMul + minthrust * (1 - powerdistEngMul))));
		document.getElementById('outfitting_stats_laden_speed'  ).innerHTML = (isNaN(ldnNavSpdMul) ? htmlErrorTH : formatAttrHTML('topspd', ldnNavSpdMul * topspd));
		document.getElementById('outfitting_stats_unladen_speed').innerHTML = (isNaN(unlNavSpdMul) ? htmlErrorTH : formatAttrHTML('topspd', unlNavSpdMul * topspd));
		document.getElementById('outfitting_stats_max_speed'    ).innerHTML = (isNaN(maxNavSpdMul) ? htmlErrorTH : formatAttrHTML('topspd', maxNavSpdMul * topspd));
		document.getElementById('outfitting_stats_cur_boost'    ).innerHTML = (isNaN(curNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatAttrHTML('bstspd', curNavSpdMul * bstspd)));
		document.getElementById('outfitting_stats_laden_boost'  ).innerHTML = (isNaN(ldnNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatAttrHTML('bstspd', ldnNavSpdMul * bstspd)));
		document.getElementById('outfitting_stats_unladen_boost').innerHTML = (isNaN(unlNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatAttrHTML('bstspd', unlNavSpdMul * bstspd)));
		document.getElementById('outfitting_stats_max_boost'    ).innerHTML = (isNaN(maxNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatAttrHTML('bstspd', maxNavSpdMul * bstspd)));
		document.getElementById('outfitting_stats_cur_boostfreq').innerHTML = (isNaN(curNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : ((curNavFrq < 5.0) ? htmlBoost5 : formatTimeHTML(curNavFrq, true))));
		document.getElementById('outfitting_stats_max_boostfreq').innerHTML = (isNaN(maxNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : ((maxNavFrq < 5.0) ? htmlBoost5 : formatTimeHTML(maxNavFrq, true))));
		
		// update hnd displays
		document.getElementById('outfitting_stats_cur_pitch'    ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatAttrHTML('pitch', curHndRotMul * (pitch * powerdistEngMul + minpitch * (1 - powerdistEngMul))));
		document.getElementById('outfitting_stats_cur_roll'     ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatAttrHTML('roll' , curHndRotMul * (roll  * powerdistEngMul + minroll  * (1 - powerdistEngMul))));
		document.getElementById('outfitting_stats_cur_yaw'      ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatAttrHTML('yaw'  , curHndRotMul * (yaw   * powerdistEngMul + minyaw   * (1 - powerdistEngMul))));
		document.getElementById('outfitting_stats_cur_pitchtime').innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (curHndRotMul * (pitch * powerdistEngMul + minpitch * (1 - powerdistEngMul))), true));
		document.getElementById('outfitting_stats_cur_rolltime' ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (curHndRotMul * (roll  * powerdistEngMul + minroll  * (1 - powerdistEngMul))), true));
		document.getElementById('outfitting_stats_cur_yawtime'  ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (curHndRotMul * (yaw   * powerdistEngMul + minyaw   * (1 - powerdistEngMul))), true));
		document.getElementById('outfitting_stats_max_pitch'    ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatAttrHTML('pitch', curHndRotMul * pitch));
		document.getElementById('outfitting_stats_max_roll'     ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatAttrHTML('roll' , curHndRotMul * roll));
		document.getElementById('outfitting_stats_max_yaw'      ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatAttrHTML('yaw'  , curHndRotMul * yaw));
		document.getElementById('outfitting_stats_max_pitchtime').innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (curHndRotMul * pitch), true));
		document.getElementById('outfitting_stats_max_rolltime' ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (curHndRotMul * roll), true));
		document.getElementById('outfitting_stats_max_yawtime'  ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (curHndRotMul * yaw), true));
	}; // updateUIStatsNavThr()
	
	
	var updateUIStatsThm = function() {
		// get primary stats
		var pwrcap = current.fit.getStat('pwrcap');
		var pwrdraw_ret = current.fit.getStat('pwrdraw_ret');
		var pwrdraw_dep = current.fit.getStat('pwrdraw_dep');
		var thmload_ct = current.fit.getStat('thmload_ct');
		var thmload_cfsd = current.fit.getStat('thmload_cfsd');
		var thmload_hardpoint_wepfull = current.fit.getStat('thmload_hardpoint_wepfull');
		var thmload_hardpoint_wepempty = current.fit.getStat('thmload_hardpoint_wepempty');
		var thmload_iscb = current.fit.getStat('thmload_iscb');
		var spinup_iscb = current.fit.getStat('spinup_iscb');
		var wepchg_sustain_cur = current.fit.getStat('wepchg_sustain_cur');
		
		var slot = current.fit.getSlot('ship', 'hull');
		var heatcap = slot.getEffectiveAttrValue('heatcap');
		var heatdismax = slot.getEffectiveAttrValue('heatdismax');
		
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.PP);
		var heateff = slot.getEffectiveAttrValue('heateff');
		
		// compute derived stats
		var thmload_pwrdraw_ret = pwrdraw_ret[0];
		for (var p = MAX_POWER_PRIORITY;  p >= 1 && thmload_pwrdraw_ret > pwrcap;  p--) {
			thmload_pwrdraw_ret -= pwrdraw_ret[p];
		}
		thmload_pwrdraw_ret *= heateff;
		var thmload_pwrdraw_dep = pwrdraw_dep[0];
		for (var p = MAX_POWER_PRIORITY;  p >= 1 && thmload_pwrdraw_dep > pwrcap;  p--) {
			thmload_pwrdraw_dep -= pwrdraw_dep[p];
		}
		thmload_pwrdraw_dep *= heateff;
		thmload_hardpoint_wepfull *= wepchg_sustain_cur;
		thmload_hardpoint_wepempty *= wepchg_sustain_cur;
		
		// update displays
		updateUIStatsThmLevel('outfitting_stats_idl_heat'     , thmload_pwrdraw_ret       , 0                               , heatdismax, heatcap);
		updateUIStatsThmLevel('outfitting_stats_thr_heat'     , thmload_ct                , thmload_pwrdraw_ret             , heatdismax, heatcap);
		updateUIStatsThmLevel('outfitting_stats_fsd_heat'     , thmload_cfsd              , thmload_pwrdraw_ret + thmload_ct, heatdismax, heatcap);
		updateUIStatsThmLevel('outfitting_stats_wpnfull_heat' , thmload_hardpoint_wepfull , thmload_pwrdraw_dep + thmload_ct, heatdismax, heatcap);
		updateUIStatsThmLevel('outfitting_stats_wpnempty_heat', thmload_hardpoint_wepempty, thmload_pwrdraw_dep + thmload_ct, heatdismax, heatcap);
		updateUIStatsThmLevel('outfitting_stats_scb_heat'     , thmload_iscb              , thmload_pwrdraw_dep + thmload_ct, heatdismax, heatcap, spinup_iscb);
	}; // updateUIStatsThm()
	
	
	var updateUIStatsThmLevel = function(elementid, thmload, thmloadBase, heatdismax, heatcap, duration) {
		var el = document.getElementById(elementid);
		el.className = '';
		if (thmload > 0) {
			thmload += thmloadBase;
			if (thmloadBase > heatdismax) {
				el.innerHTML = '<small class="semantic">N/A</small>';
				el.className = 'error';
			} else if (thmload > heatdismax) {
				var heatlevelBase = getEquilibriumHeatLevel(heatdismax, thmloadBase);
				var time10 = getTimeUntilHeatLevel(heatcap, heatdismax, thmload, heatlevelBase, 1.0);
				if (duration && (time10 > duration)) {
					el.innerHTML = formatPctHTML(getHeatLevelAtTime(heatcap, heatdismax, thmload, heatlevelBase, duration) / 1.5, 0);
				} else {
					var time15 = (heatcap / 2) / (thmload - heatdismax); // displayed heatlevel 66% -> 100% is actual heatlevel 1.0 -> 1.5
					if (duration && ((time10 + time15) > duration)) {
						el.innerHTML = formatPctHTML((2 + ((duration - time10) / time15)) / 3, 0);
					} else if (duration) {
						duration -= time10 + time15;
						var heatlevelPeak = 1.5 + (duration * (thmload - heatdismax) / heatcap);
						var timeCool = (heatlevelPeak - 1.5) / ((heatdismax - thmloadBase) / heatcap);
						el.innerHTML = ('<abbr class="error" title="Peak heat level ' + formatPctText(heatlevelPeak / 1.5, 0) + '; over 100% for ' + formatNumText(duration + timeCool, 1) + 's">' + formatTimeHTML(time10 + time15, true) + '</abbr>');
					} else {
						el.innerHTML = formatTimeHTML(time10 + time15, true);
						el.className = 'error';
					}
				}
			} else {
				el.innerHTML = formatPctHTML(getEquilibriumHeatLevel(heatdismax, thmload) / 1.5, 0);
			}
		} else {
			el.innerHTML = '<small class="semantic">N/A</small>';
		}
	}; // updateUIStatsThmLevel()
	
	
	var updateUIStatsShd = function() {
		// get primary stats
		var shieldrnfps = current.fit.getStat('shieldrnfps');
		var shieldrnfps_ammomax = current.fit.getStat('shieldrnfps_ammomax');
		var powerdist_sys = current.fit.getEffectivePowerDist('sys');
		var slot = current.fit.getSlot('ship', 'hull');
		var mass_hull = slot.getEffectiveAttrValue('mass');
		for (var slotnum = 0;  slot = current.fit.getSlot('internal', slotnum);  slotnum++) {
			if ((slot.getModule() || EMPTY_OBJ).mtype === 'isg' && slot.getPowered())
				break;
		}
		var maxmass = slot ? slot.getEffectiveAttrValue('maxmass') : 0;
		var bgenrate = slot ? slot.getEffectiveAttrValue('bgenrate') : 0;
		var genrate = slot ? slot.getEffectiveAttrValue('genrate') : 0;
		
		// get or compute derived stats
		var hasSG = !!slot;
		var isEnough = (maxmass >= mass_hull);
		var absShdRes = getPipDamageResistance(powerdist_sys) / 100;
		var kinShdRes = current.fit.getStat('_skinres') / 100;
		var thmShdRes = current.fit.getStat('_sthmres') / 100;
		var expShdRes = current.fit.getStat('_sexpres') / 100;
		var cauShdRes = current.fit.getStat('_scaures') / 100;
		var rawShdStr = current.fit.getStat('_shields');
		var ammomaxText = (shieldrnfps_ammomax / shieldrnfps).toFixed((shieldrnfps_ammomax % shieldrnfps) ? 1 : 0);
		
		// update displays
		var htmlNA = '<small class="semantic">N/A</small>';
		var htmlErrorSG = '<abbr class="error" title="Shield Generator has insufficient maximum mass">ERR</abbr>';
		document.getElementById('outfitting_stats_abs_shield_resist').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatPctHTML(absShdRes, 1)));
		document.getElementById('outfitting_stats_kin_shield_resist').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('kinres', kinShdRes * 100)));
		document.getElementById('outfitting_stats_thm_shield_resist').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('thmres', thmShdRes * 100)));
		document.getElementById('outfitting_stats_exp_shield_resist').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('expres', expShdRes * 100)));
		document.getElementById('outfitting_stats_raw_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr, 1)));
		document.getElementById('outfitting_stats_abs_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr / (1 - absShdRes), 1)));
		document.getElementById('outfitting_stats_kin_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr / (1 - absShdRes) / (1 - kinShdRes), 1)));
		document.getElementById('outfitting_stats_thm_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr / (1 - absShdRes) / (1 - thmShdRes), 1)));
		document.getElementById('outfitting_stats_exp_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr / (1 - absShdRes) / (1 - expShdRes), 1)));
	//	document.getElementById('outfitting_stats_raw_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate)));
	//	document.getElementById('outfitting_stats_abs_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate / (1 - absShdRes))));
	//	document.getElementById('outfitting_stats_kin_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate / (1 - absShdRes) / (1 - kinShdRes))));
	//	document.getElementById('outfitting_stats_thm_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate / (1 - absShdRes) / (1 - thmShdRes))));
	//	document.getElementById('outfitting_stats_exp_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate / (1 - absShdRes) / (1 - expShdRes))));
		document.getElementById('outfitting_stats_raw_shield_reinf').innerHTML = (!(hasSG && shieldrnfps) ? htmlNA : (!isEnough ? htmlErrorSG : (ammomaxText + '<small class="semantic">&times;</small>' + formatAttrHTML('shieldrnfps', shieldrnfps))));
		document.getElementById('outfitting_stats_abs_shield_reinf').innerHTML = (!(hasSG && shieldrnfps) ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shieldrnfps', shieldrnfps_ammomax / (1 - absShdRes))));
		document.getElementById('outfitting_stats_kin_shield_reinf').innerHTML = (!(hasSG && shieldrnfps) ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shieldrnfps', shieldrnfps_ammomax / (1 - absShdRes) / (1 - kinShdRes))));
		document.getElementById('outfitting_stats_thm_shield_reinf').innerHTML = (!(hasSG && shieldrnfps) ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shieldrnfps', shieldrnfps_ammomax / (1 - absShdRes) / (1 - thmShdRes))));
		document.getElementById('outfitting_stats_exp_shield_reinf').innerHTML = (!(hasSG && shieldrnfps) ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shieldrnfps', shieldrnfps_ammomax / (1 - absShdRes) / (1 - expShdRes))));
		document.getElementById('outfitting_stats_shield_build').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatTimeHTML(rawShdStr / 2 / bgenrate)));
		document.getElementById('outfitting_stats_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatTimeHTML(rawShdStr / 2 / genrate)));
	}; // updateUIStatsShd();
	
	
	var updateUIStatsArm = function() {
		// get primary stats
		var integ_imrp = current.fit.getStat('integ_imrp');
		var dmgprot = current.fit.getStat('dmgprot');
		
		var slot = current.fit.getSlot('ship', 'hull');
		var hardness = slot.getEffectiveAttrValue('hardness');
		
		// get or compute derived stats
		var mrpArmRes = (1 - dmgprot) * 100;
		var kinArmRes = current.fit.getStat('_akinres')
		var thmArmRes = current.fit.getStat('_athmres');
		var expArmRes = current.fit.getStat('_aexpres')
		var cauArmRes = current.fit.getStat('_acaures')
		var rawArmInt = current.fit.getStat('_armour')
		var kinArmInt = (rawArmInt / (1 - kinArmRes / 100));
		var thmArmInt = (rawArmInt / (1 - thmArmRes / 100));
		var expArmInt = (rawArmInt / (1 - expArmRes / 100));
		var cauArmInt = (rawArmInt / (1 - cauArmRes / 100));
		
		// update displays
		var htmlNA = '<small class="semantic">N/A</small>';
		document.getElementById('outfitting_stats_raw_armour_hardness').innerHTML = formatNumHTML(hardness, 0);
		document.getElementById('outfitting_stats_mod_armour_protect').innerHTML = (integ_imrp ? formatAttrHTML('dmgprot', mrpArmRes) : htmlNA);
		document.getElementById('outfitting_stats_kin_armour_resist').innerHTML = formatAttrHTML('kinres', kinArmRes);
		document.getElementById('outfitting_stats_thm_armour_resist').innerHTML = formatAttrHTML('thmres', thmArmRes);
		document.getElementById('outfitting_stats_exp_armour_resist').innerHTML = formatAttrHTML('expres', expArmRes);
		document.getElementById('outfitting_stats_cau_armour_resist').innerHTML = formatAttrHTML('caures', cauArmRes);
		document.getElementById('outfitting_stats_raw_armour_integ').innerHTML = formatNumHTML(rawArmInt, 1);
		document.getElementById('outfitting_stats_mod_armour_integ').innerHTML = (integ_imrp ? formatNumHTML(integ_imrp, 1) : htmlNA);
		document.getElementById('outfitting_stats_kin_armour_integ').innerHTML = formatNumHTML(kinArmInt, 1);
		document.getElementById('outfitting_stats_thm_armour_integ').innerHTML = formatNumHTML(thmArmInt, 1);
		document.getElementById('outfitting_stats_exp_armour_integ').innerHTML = formatNumHTML(expArmInt, 1);
		document.getElementById('outfitting_stats_cau_armour_integ').innerHTML = formatNumHTML(cauArmInt, 1);
	}; // updateUIStatsArm()
	
	
	var updateUIStatsWpn = function() {
		// get primary stats
		var dps = current.fit.getStat('dps');
		var dps_abs = current.fit.getStat('dps_abs');
		var dps_thm = current.fit.getStat('dps_thm');
		var dps_kin = current.fit.getStat('dps_kin');
		var dps_exp = current.fit.getStat('dps_exp');
		var dps_axe = current.fit.getStat('dps_axe');
		var dps_cau = current.fit.getStat('dps_cau');
		var dps_nodistdraw = current.fit.getStat('dps_nodistdraw');
		var dps_distdraw = current.fit.getStat('dps_distdraw');
		var distdraw_second = current.fit.getStat('distdraw_second');
		var duration_wepcap = current.fit.getStat('duration_wepcap');
		var duration_nocap = current.fit.getStat('duration_nocap');
		var wepchg_sustain_cur = current.fit.getStat('wepchg_sustain_cur');
		var wepchg_sustain_max = current.fit.getStat('wepchg_sustain_max');
		var powerdist_wep = current.fit.getEffectivePowerDist('wep');
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.PD);
		var wepcap = slot.getEffectiveAttrValue('wepcap');
		var wepchg = slot.getEffectiveAttrValue('wepchg');
		
		// compute derived stats
		var powerdistWepMul = pow(powerdist_wep / MAX_POWER_DIST, 1.1);
		var curWpnDur = (wepcap / max(0, distdraw_second - wepchg * powerdistWepMul));
		var maxWpnDur = (wepcap / max(0, distdraw_second - wepchg));
		var curWpnSus = ((dps_nodistdraw + (dps_distdraw ? (dps_distdraw * wepchg_sustain_cur) : 0)) / dps);
		var maxWpnSus = ((dps_nodistdraw + (dps_distdraw ? (dps_distdraw * wepchg_sustain_max) : 0)) / dps);
		var ammWpnDur = min(duration_nocap, ((duration_wepcap <= maxWpnDur) ? duration_wepcap : (maxWpnDur + (duration_wepcap - maxWpnDur) / maxWpnSus)));
		
		// update displays
		var htmlNA = '<small class="semantic">N/A</small>';
		document.getElementById('outfitting_stats_wpn_raw_burst').innerHTML = (dps ? formatAttrHTML('dps', dps, 1) : htmlNA);
		document.getElementById('outfitting_stats_wpn_abs_burst').innerHTML = (dps ? formatPctHTML(dps_abs / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_thm_burst').innerHTML = (dps ? formatPctHTML(dps_thm / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_kin_burst').innerHTML = (dps ? formatPctHTML(dps_kin / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_exp_burst').innerHTML = (dps ? formatPctHTML(dps_exp / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_axe_burst').innerHTML = (dps ? formatPctHTML(dps_axe / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_cur_dur').innerHTML = (dps ? formatTimeHTML(curWpnDur) : htmlNA);
		document.getElementById('outfitting_stats_wpn_max_dur').innerHTML = (dps ? formatTimeHTML(maxWpnDur) : htmlNA);
		document.getElementById('outfitting_stats_wpn_amm_dur').innerHTML = (dps ? formatTimeHTML(ammWpnDur) : htmlNA);
		document.getElementById('outfitting_stats_wpn_cur_sus').innerHTML = (dps ? formatPctHTML(curWpnSus, 1) : htmlNA);
		document.getElementById('outfitting_stats_wpn_max_sus').innerHTML = (dps ? formatPctHTML(maxWpnSus, 1) : htmlNA);
	}; // updateUIStatsWpn()
	
	
	/*
	* UI EVENT HANDLERS
	*/
	
	
	var onWindowResize = function(e) {
		if (current.resize)
			clearTimeout(current.resize);
		current.resize = setTimeout(onWindowResizeTimeout, TIMEOUT_RESIZE);
		updateUIFullscreen();
	}; // onWindowResize()
	
	
	var onWindowResizeTimeout = function() {
		if (current.resize) {
			clearTimeout(current.resize);
			current.resize = null;
		}
		updateUILayout();
		updateUIStatsPanels();
	}; // onWindowResizeTimeout()
	
	
	var onDocumentClickFocus = function(e) {
		if (!current.popup.element)
			return;
		var el = e.target;
		while (el && (el !== current.popup.element && el !== current.popup.trigger))
			el = el.parentNode;
		if (!el) {
			if (current.popup.refocus) {
				e.preventDefault();
				current.popup.refocus.focus();
				if (current.popup.refocus.select)
					current.popup.refocus.select();
			} else {
				hideUIPopup();
			}
		}
	}; // onDocumentClickFocus()
	
	
	var onDocumentDragEnter = function(e) {
		if (contains(e.dataTransfer.types, 'Files')) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
		}
	}; // onDocumentDragEnter()
	
	
	var onDocumentDragOver = function(e) {
		if (contains(e.dataTransfer.types, 'Files')) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
		}
	}; // onDocumentDragOver()
	
	
	var onDocumentDrop = function(e) {
		var file = e.dataTransfer.files[0];
		if (file) {
			e.stopPropagation();
			e.preventDefault();
			var reader = new FileReader();
			reader.addEventListener('load', onDocumentDrop_FilereaderLoad);
			reader.readAsText(file);
		}
	}; // onDocumentDrop()
	
	
	var onDocumentDrop_FilereaderLoad = function(e) {
		hideUIPopup();
		importBuild(e.target.result);
	}; // onDocumentDrop_FilereaderLoad()
	
	
	var onUIModalKeydownCapture = function(e) {
		if ((e.key === 'Escape') || ((e.keyCode || e.which) === 27)) {
			e.preventDefault();
			if (current.popup.sticky) {
				var onCancel = current.popup.onCancel;
				if (typeof onCancel === 'function')
					onCancel(null);
			} else {
				var trigger = current.popup.trigger;
				hideUIPopup();
				if (trigger)
					trigger.focus();
			}
		}
	}; // onUIModalKeydownCapture()
	
	
	var onUIModalClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'DIV')
			el = el.parentNode;
		if (el === e.currentTarget) {
			if (current.popup.sticky) {
				e.preventDefault();
				if (current.popup.refocus) {
					current.popup.refocus.focus();
					if (current.popup.refocus.select)
						current.popup.refocus.select();
				}
			} else {
				hideUIPopup();
			}
		}
	}; // onUIModalClick()
	
	
	var onUIPopupButtonClick = function(e) {
		e.preventDefault();
		var trigger = current.popup.trigger;
		var onOkay = current.popup.onOkay;
		var onCancel = current.popup.onCancel;
		var value = document.forms.popup.elements.textbox.value;
		hideUIPopup();
		if (trigger)
			trigger.focus();
		if (e.target.name === 'okay') {
			if (typeof onOkay === 'function')
				onOkay(value);
		} else if (e.target.name === 'cancel') {
			if (typeof onCancel === 'function')
				onCancel(value);
		}
	}; // onUIPopupButtonClick()
	
	
	var onUIMaximizeButtonClick = function(e) {
		if (cache.feature.requestFullscreen && cache.feature.cancelFullscreen) {
			cache.feature.requestFullscreen.call(window.document.documentElement);
		}
	}; // onUIMaximizeButtonClick()
	
	
	var onUIMinimizeButtonClick = function(e) {
		if (cache.feature.cancelFullscreen) {
			cache.feature.cancelFullscreen.call(window.document);
		}
	}; // onUIMinimizeButtonClick()
	
	
	var onUIPageHeaderChange = function(e) {
		setUIPageTab(e.target.value);
	}; // onUIPageHeaderChange()
	
	
	var onUIContextMenu = function(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}; // onUIContextMenu()
	
	
	var onUIShipyardTabChange = function(e) {
		if (e.target.name === 'tab' && e.target.checked) {
			setUIShipyardTab(e.target.value);
		}
	}; // onUIShipyardTabChange()
	
	
	var onUIShipyardShipsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON') {
			el = el.parentNode;
		}
		if (!el || el.disabled) {
		} else {
			var tokens = el.name.split('_');
			if (tokens[1] === 'ship') {
				setCurrentFit(new Build(el.value, true), '');
				setUIPageTab('outfitting');
			}
		}
	}; // onUIShipyardShipsClick()
	
	
	var onUIShipyardStoredBuildsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON') {
			el = el.parentNode;
		}
		if (!el || el.disabled) {
		} else {
			var tokens = el.name.split('_');
			switch (tokens[1]) {
			case 'reload':
				setCurrentFitNameHash(el.value);
				setUIPageTab('outfitting');
				break;
				
			case 'rename':
				renameStoredBuild(el.value);
				break;
				
			case 'delete':
				deleteStoredBuild(el.value);
				break;
			}
		}
	}; // onUIShipyardStoredBuildsClick()
	
	
	var onUIModuleTabChange = function(e) {
		if (e.target.name === 'tab' && e.target.checked) {
			setUIModuleTab(e.target.value);
		}
	}; // onUIModuleTabChange()
	
	
	var onUIModulePickerChange = function(e) {
		if (e.target.name === 'module' && e.target.checked) {
			var tokens = e.target.value.split('.');
			var modid = tokens[0] | 0;
			var namehash = tokens[1];
			setUIOutfittingFocus('module');
			setUIPickerModule(modid, namehash, false);
			updateUIDetailsStoredModules();
			updateUIDetailsStoredModuleControls(true, namehash);
			updateUIDetailsModule();
		}
	}; // onUIModulePickerChange()
	
	
	var onUIModulePickerClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'LABEL' && el.tagName !== 'INPUT') {
			el = el.parentNode;
		}
		if (!el) {
		} else if (el.tagName === 'LABEL') {
			var inputs = el.getElementsByTagName('INPUT');
			if (inputs.length > 0 && inputs[0].name === 'module') {
				var modtag = inputs[0].value;
				var tokens = modtag.split('.');
				var modid = tokens[0] | 0;
				var namehash = tokens[1];
				if (!current.pickerClick[modtag]) { // single
					current.pickerClick[modtag] = setTimeout(onUIModulePickerClickTimeout, TIMEOUT_DBLCLICK, modtag);
					if (inputs[0].checked && current.outfitting_focus !== 'module') {
						setUIOutfittingFocus('module');
						updateUIDetailsStoredModules();
						updateUIDetailsStoredModuleControls(true, namehash);
						updateUIDetailsModule();
					}
				} else { // double
					clearTimeout(current.pickerClick[modtag]);
					delete current.pickerClick[modtag];
					setCurrentFitSlotModule(current.group, current.slot, modid, namehash);
					setUIOutfittingPanels('slots',  'modules', 'slots');
				}
			}
		}
	}; // onUIModulePickerClick()
	
	
	var onUIModulePickerClickTimeout = function(modtag) {
		if (current.pickerClick[modtag]) {
			clearTimeout(current.pickerClick[modtag]);
			delete current.pickerClick[modtag];
			var tokens = modtag.split('.');
			var modid = tokens[0] | 0;
			var namehash = tokens[1];
			if (modid || namehash) {
				setUIOutfittingPanels('details');
			}
		}
	}; // onUIModulePickerClickTimeout()
	
	
	var onUIModulePickerDblClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'LABEL' && el.tagName !== 'INPUT') {
			el = el.parentNode;
		}
		if (!el) {
		} else if (el.tagName === 'LABEL') {
			e.preventDefault();
			return false;
		}
	}; // onUIModulePickerDblClick()
	
	
	var onUIModulePickerLabelTouchStart = function(e) {
		e.stopPropagation();
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.pickerTouch[inputID];
		if (e.touches.length !== 1) {
			if (touchdata) {
				clearTimeout(touchdata.timeout);
				delete current.pickerTouch[inputID];
			}
			label.removeEventListener('touchmove', onUIModulePickerLabelTouchMove);
			label.removeEventListener('touchend', onUIModulePickerLabelTouchEnd);
			return true;
		}
		if (touchdata) {
			clearTimeout(touchdata.timeout);
		} else {
			current.pickerTouch[inputID] = touchdata = { timeout:null, x:0, y:0 };
		}
		touchdata.timeout = setTimeout(onUIModulePickerLabelTouchTimeout, TIMEOUT_LONGPRESS, inputID);
		touchdata.x = e.touches[0].screenX;
		touchdata.y = e.touches[0].screenY;
		label.addEventListener('touchmove', onUIModulePickerLabelTouchMove);
		label.addEventListener('touchend', onUIModulePickerLabelTouchEnd);
		return true;
	}; // onUIModulePickerLabelTouchStart()
	
	
	var onUIModulePickerLabelTouchMove = function(e) {
		e.stopPropagation();
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.pickerTouch[inputID];
		if (!touchdata || e.touches.length !== 1 || abs(e.touches[0].screenX - touchdata.x) > TOLERANCE_TOUCH || abs(e.touches[0].screenY - touchdata.y) > TOLERANCE_TOUCH) {
			if (touchdata) {
				clearTimeout(touchdata.timeout);
				delete current.pickerTouch[inputID];
			}
			label.removeEventListener('touchmove', onUIModulePickerLabelTouchMove);
			label.removeEventListener('touchend', onUIModulePickerLabelTouchEnd);
			return true;
		}
		if (e.cancelable)
			e.preventDefault();
		return false;
	}; // onUIModulePickerLabelTouchMove()
	
	
	var onUIModulePickerLabelTouchEnd = function(e) {
		e.stopPropagation();
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.pickerTouch[inputID];
		if (touchdata) {
			clearTimeout(touchdata.timeout);
			delete current.pickerTouch[inputID];
		}
		label.removeEventListener('touchmove', onUIModulePickerLabelTouchMove);
		label.removeEventListener('touchend', onUIModulePickerLabelTouchEnd);
		if (!touchdata || e.touches.length > 0 || e.changedTouches.length !== 1 || abs(e.changedTouches[0].screenX - touchdata.x) > TOLERANCE_TOUCH || abs(e.changedTouches[0].screenY - touchdata.y) > TOLERANCE_TOUCH) {
			return true;
		}
		var input = document.getElementById(inputID);
		if ((input && !input.checked) || current.outfitting_focus !== 'module') {
			var tokens = input.value.split('.');
			var modid = tokens[0] | 0;
			var namehash = tokens[1];
			setUIOutfittingFocus('module');
			if (input && !input.checked)
				setUIPickerModule(modid, namehash, false);
			updateUIDetailsStoredModules();
			updateUIDetailsStoredModuleControls(true, namehash);
			updateUIDetailsModule();
		}
		setUIOutfittingPanels('details');
		if (e.cancelable)
			e.preventDefault();
		return false;
	}; // onUIModulePickerLabelTouchEnd()
	
	
	var onUIModulePickerLabelTouchTimeout = function(inputID) {
		var input = document.getElementById(inputID);
		var label = input.parentNode;
		var touchdata = current.pickerTouch[inputID];
		if (touchdata) {
			clearTimeout(touchdata.timeout);
			delete current.pickerTouch[inputID];
		}
		label.removeEventListener('touchmove', onUIModulePickerLabelTouchMove);
		label.removeEventListener('touchend', onUIModulePickerLabelTouchEnd);
		if (!touchdata) {
			return true;
		}
		var tokens = input.value.split('.');
		var modid = tokens[0] | 0;
		var namehash = tokens[1];
		setCurrentFitSlotModule(current.group, current.slot, modid, namehash);
		setUIOutfittingPanels('slots',  'modules', 'slots');
		return false;
	}; // onUIModulePickerLabelTouchTimeout()
	
	
	var onUIModuleButtonsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON')
			el = el.parentNode;
		if (!el || el.disabled) {
		} else if (el.name === 'back') {
			if (current.outfitting_focus === 'slot') {
				setUIOutfittingPanels('details',  'modules', 'slots');
			} else if (current.outfitting_focus === 'module') {
				setUIOutfittingPanels('slots',  'modules', 'slots');
			}
		} else if (el.name === 'details') {
			if (current.outfitting_focus === 'slot') {
				setUIOutfittingPanels('details',  'slots', 'details');
			} else if (current.outfitting_focus === 'module') {
				setUIOutfittingPanels('details',  'modules', 'details');
			}
		}
	}; // onUIModuleButtonsClick()
	
	
	var onUIModulePickerDragStart = function(e) {
		if (e.target && e.target.tagName === 'LABEL') {
			var inputs = e.target.getElementsByTagName('INPUT');
			var tokens = inputs[0].value.split('.');
			var modid = tokens[0] | 0;
			var namehash = tokens[1];
			// TODO: ghost bug in chrome
			e.dataTransfer.setData('edsy/mid', modid | 0);
			e.dataTransfer.setData('edsy/namehash', namehash || '');
			e.dataTransfer.effectAllowed = 'copy';
			setCurrentDrag(modid, namehash);
		}
	}; // onUIModulePickerDragStart()
	
	
	var onUIModulePickerDragEnd = function(e) {
		setCurrentDrag();
	}; // onUIModulePickerDragEnd()
	
	
	var onUIModulePickerDragEnter = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/slot')) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
			// TODO: .dragready highlighting?
		}
	}; // onUIModulePickerDragEnter()
	
	
	var onUIModulePickerDragOver = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/slot')) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
		}
	}; // onUIModulePickerDragOver()
	
	
	var onUIModulePickerDragLeave = function(e) {
		// TODO: .dragready highlighting?
	}; // onUIModulePickerDragLeave()
	
	
	var onUIModulePickerDrop = function(e) {
		var group = e.dataTransfer.getData('edsy/group');
		var slot = e.dataTransfer.getData('edsy/slot');
		if (group) {
			e.preventDefault();
			e.stopPropagation();
			setCurrentFitSlotModule(group, slot, 0);
		}
	}; // onUIModulePickerDrop()
	
	
	var onUIFitSettingsChange = function(e) {
		if (e.target.name === 'outfitting_fit_stored') {
			setCurrentFitNameHash(e.target.value);
		} else {
			updateUIFitColumns();
			// let the changes finish rendering
			setTimeout(updateUILayout, 1);
		}
	}; // onUIFitSettingsChange()
	
	
	var onUIFitSettingsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON')
			el = el.parentNode;
		if (!el || el.disabled) {
		} else {
			var tokens = el.id.split('_');
			switch (tokens[2]) {
			case 'import':
				e.preventDefault();
				showUITextPopup(
						'Import loadout(s) by pasting them below or dragging a file onto the page.',
						'Supported import formats include:\n\n' +
						'* E:D Shipyard URL(s)\n' + // TODO: text exports?
						'* Companion API JSON export (via EDAPI, EDCE, EDMC, etc)\n' +
						'* Journal "Loadout" event JSON object(s)\n', // TODO: coriolis
						e.target, false,
						importBuild, true
				);
				break;
				
			case 'export':
				// TODO
				break;
				
			case 'stored':
				e.preventDefault();
				var namehash = document.forms.fit.elements.outfitting_fit_stored.value;
				
				switch (tokens[3]) {
				case 'reload':
					setCurrentFitNameHash(namehash);
					break;
					
				case 'save':
					saveCurrentStoredBuild(false);
					break;
					
				case 'saveas':
					saveCurrentStoredBuild(true);
					break;
					
				case 'rename':
					renameStoredBuild(namehash);
					break;
					
				case 'delete':
					deleteStoredBuild(namehash);
					break;
				}
				break;
			}
		}
	}; // onUIFitSettingsClick()
	
	
	var onUIFitSlotsMouseDown = function(e) {
		if (e.button != 2 && e.which != 3)
			return true;
		var el = e.target;
		while (el && el.tagName !== 'LABEL' && el.tagName !== 'INPUT') {
			el = el.parentNode;
		}
		if (!el) {
		} else if (el.tagName === 'LABEL') {
			var inputs = el.getElementsByTagName('INPUT');
			if (inputs.length > 0 && inputs[0].name === 'slot') {
				e.preventDefault();
				var slottag =inputs[0].value; 
				var tokens = slottag.split('_');
				var slotgroup = tokens[0];
				var slotnum = tokens[1];
				if (!setCurrentFitSlotModule(slotgroup, slotnum, 0))
					setCurrentSlot(slotgroup, slotnum);
				return false;
			}
		}
		return true;
	}; // onUIFitSlotsMouseDown()
	
	
	var onUIFitSlotsChange = function(e) {
		if (e.target.name === 'slot') {
			var tokens = e.target.value.split('_');
			setCurrentSlot(tokens[0], tokens[1]);
		} else if (e.target.name === 'shipname') {
			current.fit.setName(e.target.value);
			updateUIFitStoredBuildControls();
			updateUIFitHash();
		} else if (e.target.name === 'shipnametag') {
			current.fit.setNameTag(e.target.value);
			updateUIFitStoredBuildControls();
			updateUIFitHash();
		} else if (e.target.type === 'checkbox') {
			var tokens = e.target.name.split('_');
			if (tokens[0] === 'powered') {
				setCurrentFitSlotPowered(tokens[1], tokens[2], e.target.checked);
			}
		} else if (e.target.name === 'hardpoint_attr1' || e.target.name === 'hardpoint_attr2') {
			for (var slotnum = 0;  current.fit.getSlot('hardpoint', slotnum);  slotnum++) {
				updateUIFitSlot('hardpoint', slotnum);
			}
		}
	}; // onUIFitSlotsChange()
	
	
	var onUIFitSlotsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'LABEL' && el.tagName !== 'INPUT' && el.tagName !== 'BUTTON') {
			el = el.parentNode;
		}
		if (!el) {
		} else if (el.tagName === 'LABEL') {
			var inputs = el.getElementsByTagName('INPUT');
			if (inputs.length > 0 && inputs[0].name === 'slot') {
				var slottag = inputs[0].value;
				if (!current.slotsClick[slottag]) { // single
					current.slotsClick[slottag] = setTimeout(onUIFitSlotsClickTimeout, TIMEOUT_DBLCLICK, slottag);
					if (inputs[0].checked && current.outfitting_focus !== 'slot') {
						var tokens = slottag.split('_');
						var slotgroup = tokens[0];
						var slotnum = tokens[1];
						setCurrentSlot(slotgroup, slotnum);
					}
				} else { // double
					clearTimeout(current.slotsClick[slottag]);
					delete current.slotsClick[slottag];
					setUIOutfittingFocus('module');
					updateUIDetailsStoredModules();
					updateUIDetailsStoredModuleControls(true);
					updateUIDetailsModule();
					setUIOutfittingPanels('modules',  'modules', 'slots');
				}
			}
		} else if (el.tagName === 'BUTTON') {
			e.preventDefault();
			var tokens = el.name.split('_');
			if (el.disabled) {
			} else if (tokens[0] === 'priority') {
				changeCurrentFitSlotPriority(tokens[1], tokens[2], 1);
			} else if (tokens[0] === 'crewdist') {
				changeCurrentFitCrewDist(tokens[1], 1);
			} else if (tokens[0] === 'powerdist') {
				if (tokens[1] === 'rst') {
					resetCurrentFitPowerDist();
				} else {
					changeCurrentFitPowerDist(tokens[1], 2);
				}
			}
		}
	}; // onUIFitSlotsClick()
	
	
	var onUIFitSlotsClickTimeout = function(slottag) {
		if (current.slotsClick[slottag]) {
			clearTimeout(current.slotsClick[slottag]);
			delete current.slotsClick[slottag];
			setUIOutfittingPanels('details');
		}
	}; // onUIFitSlotsClickTimeout()
	
	
	var onUIPowerDistClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON') {
			el = el.parentNode;
		}
		if (!el) {
		} else if (el.tagName === 'BUTTON') {
			e.preventDefault();
			e.stopPropagation();
			var tokens = el.name.split('_');
			if (el.disabled) {
			} else if (tokens[0] === 'crewdist') {
				changeCurrentFitCrewDist(tokens[1], 1);
			} else if (tokens[0] === 'powerdist') {
				if (tokens[1] === 'rst') {
					resetCurrentFitPowerDist();
				} else {
					changeCurrentFitPowerDist(tokens[1], 2);
				}
			}
		}
	}; // onUIPowerDistClick()
	
	
	var onUIFitSlotsDblClick = function(e) {
		e.preventDefault();
		return false;
	}; // onUIFitSlotsDblClick()
	
	
	var onUIFitSlotsTouchStart = function(e) {
		e.stopPropagation();
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.slotsTouch[inputID];
		if (e.touches.length !== 1) {
			if (touchdata) {
				clearTimeout(touchdata.timeout);
				delete current.slotsTouch[inputID];
			}
			label.removeEventListener('touchmove', onUIFitSlotsTouchMove);
			label.removeEventListener('touchend', onUIFitSlotsTouchEnd);
			return true;
		}
		if (touchdata) {
			clearTimeout(touchdata.timeout);
		} else {
			current.slotsTouch[inputID] = touchdata = { timeout:null, x:0, y:0 };
		}
		touchdata.timeout = setTimeout(onUIFitSlotsTouchTimeout, TIMEOUT_LONGPRESS, inputID);
		touchdata.x = e.touches[0].screenX;
		touchdata.y = e.touches[0].screenY;
		label.addEventListener('touchmove', onUIFitSlotsTouchMove);
		label.addEventListener('touchend', onUIFitSlotsTouchEnd);
		return true;
	}; // onUIFitSlotsTouchStart()
	
	
	var onUIFitSlotsTouchMove = function(e) {
		e.stopPropagation();
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.slotsTouch[inputID];
		if (!touchdata || e.touches.length !== 1 || abs(e.touches[0].screenX - touchdata.x) > TOLERANCE_TOUCH || abs(e.touches[0].screenY - touchdata.y) > TOLERANCE_TOUCH) {
			if (touchdata) {
				clearTimeout(touchdata.timeout);
				delete current.slotsTouch[inputID];
			}
			label.removeEventListener('touchmove', onUIFitSlotsTouchMove);
			label.removeEventListener('touchend', onUIFitSlotsTouchEnd);
			return true;
		}
		if (e.cancelable)
			e.preventDefault();
		return false;
	}; // onUIFitSlotsTouchMove()
	
	
	var onUIFitSlotsTouchEnd = function(e) {
		e.stopPropagation();
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.slotsTouch[inputID];
		if (touchdata) {
			clearTimeout(touchdata.timeout);
			delete current.slotsTouch[inputID];
		}
		label.removeEventListener('touchmove', onUIFitSlotsTouchMove);
		label.removeEventListener('touchend', onUIFitSlotsTouchEnd);
		if (!touchdata || e.touches.length > 0 || e.changedTouches.length !== 1 || abs(e.changedTouches[0].screenX - touchdata.x) > TOLERANCE_TOUCH || abs(e.changedTouches[0].screenY - touchdata.y) > TOLERANCE_TOUCH) {
			return true;
		}
		var input = document.getElementById(inputID);
		if ((input && !input.checked) || current.outfitting_focus !== 'slot') {
			var tokens = input.value.split('_');
			var slotgroup = tokens[0];
			var slotnum = tokens[1];
			setCurrentSlot(slotgroup, slotnum);
		}
		setUIOutfittingPanels('details');
		if (e.cancelable)
			e.preventDefault();
		return false;
	}; // onUIFitSlotsTouchEnd()
	
	
	var onUIFitSlotsTouchTimeout = function(inputID) {
		var input = document.getElementById(inputID);
		var label = input.parentNode;
		var touchdata = current.slotsTouch[inputID];
		if (touchdata) {
			clearTimeout(touchdata.timeout);
			delete current.slotsTouch[inputID];
		}
		label.removeEventListener('touchmove', onUIFitSlotsTouchMove);
		label.removeEventListener('touchend', onUIFitSlotsTouchEnd);
		if (!touchdata) {
			return true;
		}
		var tokens = input.value.split('_');
		var slotgroup = tokens[0];
		var slotnum = tokens[1];
		setCurrentSlot(slotgroup, slotnum);
		setUIOutfittingFocus('module');
		updateUIDetailsStoredModules();
		updateUIDetailsStoredModuleControls(true);
		updateUIDetailsModule();
		setUIOutfittingPanels('modules',  'modules', 'slots');
		return false;
	}; // onUIFitSlotsTouchTimeout()
	
	
	var onUIFitSlotsDragStart = function(e) {
		if (e.target && e.target.tagName === 'LABEL') {
			var inputs = e.target.getElementsByTagName('INPUT');
			var tokens = inputs[0].value.split('_');
			var slotgroup = tokens[0];
			var slotnum = tokens[1];
			var modid = current.fit.getSlot(slotgroup, slotnum).getModuleID();
			if (!GROUP_LABEL[slotgroup] || slotgroup === 'component' || !modid) {
				e.preventDefault();
				return;
			}
			// TODO: ghost bug in chrome
			e.dataTransfer.setData('edsy/mid', modid | 0);
			e.dataTransfer.setData('edsy/group', slotgroup || '');
			e.dataTransfer.setData('edsy/slot', slotnum || '');
			e.dataTransfer.effectAllowed = 'copyMove';
			setCurrentDrag(modid, null, slotgroup, slotnum);
		}
	}; // onUIFitSlotsDragStart()
	
	
	var onUIFitSlotsDragEnd = function(e) {
		setCurrentDrag();
	}; // onUIFitSlotsDragEnd()
	
	
	var onUIFitSlotsDragEnter = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/mid')) {
			e.preventDefault();
			// TODO: .dragready highlighting?
		}
	}; // onUIFitSlotsDragEnter()
	
	
	var onUIFitSlotsDragOver = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/mid')) {
			e.preventDefault();
		}
	}; // onUIFitSlotsDragOver()
	
	
	var onUIFitSlotsDragLeave = function(e) {
		// TODO: .dragready highlighting?
	}; // onUIFitSlotsDragLeave()
	
	
	var onUIFitSlotsDrop = function(e) {
		var tr = e.target;
		while (tr && tr.tagName !== 'TR')
			tr = tr.parentNode;
		if (!tr)
			return;
		var modid = parseInt(e.dataTransfer.getData('edsy/mid'));
		var namehash = e.dataTransfer.getData('edsy/namehash');
		var group1 = e.dataTransfer.getData('edsy/group');
		var slot1 = e.dataTransfer.getData('edsy/slot');
		var tokens = tr.id.split('_'); // outfitting_fit_slot_(group)_(slot)
		var group2 = tokens[3];
		var slot2 = tokens[4];
		if (group1) {
			e.preventDefault();
			e.stopPropagation();
			if (e.dataTransfer.dropEffect === 'copy') {
				copyCurrentFitSlotModule(group1, slot1, group2, slot2);
			} else {
				swapCurrentFitSlotModules(group1, slot1, group2, slot2);
			}
		} else {
			e.preventDefault();
			e.stopPropagation();
			setCurrentFitSlotModule(group2, slot2, modid, namehash);
		}
	}; // onUIFitSlotsDrop()
	
	
	var onUIDetailsSettingsChange = function(e) {
		if (e.target.name === 'outfitting_details_stored') {
			setUIDetailsNameHash(e.target.value);
		}
	}; // onUIFitSettingsChange()
	
	
	var onUIDetailsSettingsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON')
			el = el.parentNode;
		if (!el || el.disabled) {
		} else {
			var tokens = el.id.split('_');
			if (tokens[2] === 'stored') {
				e.preventDefault();
				var namehash = document.forms.details.elements.outfitting_details_stored.value;
				
				switch (tokens[3]) {
				case 'reload':
					setUIDetailsNameHash(namehash);
					break;
					
				case 'save':
					saveCurrentStoredModule(false);
					break;
					
				case 'saveas':
					saveCurrentStoredModule(true);
					break;
					
				case 'rename':
					renameStoredModule(namehash);
					break;
					
				case 'delete':
					deleteStoredModule(namehash);
					break;
				}
			}
		}
	}; // onUIFitSettingsClick()
	
	
	var onUIDetailsModuleChange = function(e) {
		var slot = current.fit.getSlot(current.group, current.slot);
		if (e.target.name === 'discount') {
			setUIDetailsDiscount(e.target.value, e.target.checked);
		} else if (e.target.name === 'blueprint') {
			setUIDetailsBlueprintID(e.target.value);
		} else if (e.target.name === 'blueprint_grade') {
			setUIDetailsBlueprintGrade(parseInt(e.target.value));
		} else if (e.target.name === 'blueprint_roll') {
			setUIDetailsBlueprintRoll(parseFloat(e.target.value));
		} else if (e.target.name === 'expeffect') {
			setUIDetailsExpeffect(e.target.value);
		} else if (e.target.tagName === 'INPUT') {
			setUIDetailsAttrText(e.target.name, e.target.value);
		}
	}; // onUIDetailsModuleChange()
	
	
	var onUIDetailsButtonsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON')
			el = el.parentNode;
		if (!el || el.disabled) {
		} else if (el.name === 'back') {
			if (current.outfitting_focus === 'slot') {
				setUIOutfittingPanels('slots',  'modules', 'slots');
			} else if (current.outfitting_focus === 'module') {
				setUIOutfittingPanels('modules',  'modules', 'slots');
			}
		} else if (el.name === 'replace') {
			if (current.outfitting_focus === 'slot') {
				setUIOutfittingFocus('module');
				updateUIDetailsStoredModules();
				updateUIDetailsStoredModuleControls(true);
				updateUIDetailsModule();
				setUIOutfittingPanels('modules',  'modules', 'slots');
			} else if (current.outfitting_focus === 'module') {
				setCurrentFitSlotModule(current.group, current.slot, null, null, current.pickerSlot.getStoredHash());
				setUIOutfittingPanels('slots',  'slots', 'details');
			}
		}
	}; // onUIDetailsButtonsClick()
	
	
	var onUIBottomChange = function(e) {
		var tokens = e.target.id.split('_'); // stats_toggle_(#)
		if (tokens[0] === 'stats' && tokens[1] === 'toggle' && e.target.checked) {
			// let the changes finish rendering
			setTimeout(updateUIStatsPanels, 1, tokens[2]);
		}
	}; // onUIBottomChange()
	
	
	var onUIStatsInputWheel = function(e) {
		e.preventDefault();
		var mod;
		if (e.deltaY) {
			mod = (e.deltaY > 0) ? -1 : 1;
		} else if (e.detail) {
			mod = (e.detail > 0) ? -1 : 1;
		} else if (e.wheelDelta) {
			mod = (e.wheelDelta > 0) ? 1 : -1;
		} else {
			return;
		}
		
		var scale = 0;
		var value = parseFloat(e.target.value);
		var step = (e.shiftKey ? 10 : 1);
		value = (((mod > 0) ? (floor(round(value / pow(10, -scale)) / step) + 1) : (ceil(round(value / pow(10, -scale)) / step) - 1)) * pow(10, -scale) * step).toFixed(scale);
		switch (e.target.name) {
		case 'stats_cur_fuel':   setStatsCurFuel(value);   break;
		case 'stats_cur_cargo':  setStatsCurCargo(value);  break;
		}
	}; // onUIStatsInputWheel()
	
	
	var onUIStatsInputChange = function(e) {
		e.stopPropagation();
		switch (e.target.name) {
		case 'stats_cur_fuel':   setStatsCurFuel(parseFloat(e.target.value) || 0);   break;
		case 'stats_cur_cargo':  setStatsCurCargo(parseFloat(e.target.value) || 0);  break;
		}
	}; // onUIStatsInputChange()
	
	
	var onUIOptionsChange = function(e) {
		updateUIOptions();
	}; // onUIOptionsChange()
	
	
	var onWindowHashChange = function(e) {
		processURLHash(window.location.hash, true);
	}; // onWindowHashChange()
	
	
	var onBodyFocus = function(e) {
		if (e.target.tagName === 'INPUT' && e.target.type === 'text' && e.target.select)
			e.target.select();
	}; // onBodyFocus()
	
	
	var onFormSubmit = function(e) {
		e.preventDefault();
	}; // onFormSubmit()
	
	
	var onStorageEvent = function(e) {
		readStoredBuilds();
		updateUIShipyardStoredBuilds();
		updateUIFitStoredBuilds();
		readStoredModules();
		updateUIModulePickerStoredModules();
		updateUIDetailsStoredModules();
		updateUIDetailsStoredModuleControls();
	}; // onStorageEvent()
	
	
	var onLinkEmailClick = function(e) {
		e.preventDefault();
		showUITextPopup('', String.fromCharCode(116,97,108,101,100,101,110,48,64,103,109,97,105,108,46,99,111,109), e.target, false); // just to dissuade any email harvesting bots
	}; // onLinkEmailClick()
	
	
	var verifyVersionSync = function() {
		var vH,vC,vD,vJ;
		try {
			vH = document.getElementById('edsy_versions_html').getAttribute('content').split(',');
			vH = [ parseInt(vH[0]),parseInt(vH[1]),parseInt(vH[2]),parseInt(vH[3]) ];
		} catch (e) {
			vH = [ 0,0,0,0 ];
		}
		try {
			vC = getComputedStyle(document.documentElement).getPropertyValue('--edsy-versions-css').split(',');
			vC = [ parseInt(vC[0]),parseInt(vC[1]),parseInt(vC[2]),parseInt(vC[3]) ];
		} catch (e) {
			vC = [ 0,0,0,0 ];
		}
		try {
			vD = ((eddb || EMPTY_OBJ).edsy_versions_db || EMPTY_ARR);
			vD = [ parseInt(vD[0]),parseInt(vD[1]),parseInt(vD[2]),parseInt(vD[3]) ];
		} catch (e) {
			vD = [ 0,0,0,0 ];
		}
		try {
			vJ = (VERSIONS || EMPTY_ARR);
			vJ = [ parseInt(vJ[0]),parseInt(vJ[1]),parseInt(vJ[2]),parseInt(vJ[3]) ];
		} catch (e) {
			vJ = [ 0,0,0,0 ];
		}
		
		if (vH[0] >= max(vC[0], max(vD[0], vJ[0]))) {
			if (vC[1] >= max(vH[1], max(vD[1], vJ[1]))) {
				if (vD[2] >= max(vH[2], max(vC[2], vJ[2]))) {
					if (vJ[3] >= max(vH[3], max(vC[3], vD[3]))) {
						return true;
					} else {
						console.log('ERROR: EDSY JS version mismatch: ' + vH[3] + ' / ' + vC[3] + ' / ' + vD[3] + ' / (' + vJ[3] + ')');
					}
				} else {
					console.log('ERROR: EDSY DB version mismatch: ' + vH[2] + ' / ' + vC[2] + ' / (' + vD[2] + ') / ' + vJ[2]);
				}
			} else {
				console.log('ERROR: EDSY CSS version mismatch: ' + vH[1] + ' / (' + vC[1] + ') / ' + vD[1] + ' / ' + vJ[1]);
			}
		} else {
			console.log('ERROR: EDSY HTML version mismatch: (' + vH[0] + ') / ' + vC[0] + ' / ' + vD[0] + ' / ' + vJ[0]);
		}
		return false;
	}; // verifyVersionSync()
	
	
	var onDOMContentLoaded = function(e) {
		// add popup events now, in case we need them for the version sync
		document.getElementById('popup_modal').addEventListener('keydown', onUIModalKeydownCapture, true);
		document.getElementById('popup_modal').addEventListener('click', onUIModalClick);
		document.getElementById('popup_cancel').addEventListener('click', onUIPopupButtonClick);
		document.getElementById('popup_okay').addEventListener('click', onUIPopupButtonClick);
		
		// check all source file versions
		if (!verifyVersionSync()) {
			document.forms.popup.addEventListener('submit', onFormSubmit);
			showUITextPopup(
					"<h1>A new version is available!</h1><h3>Click Okay to update, or force-refresh in your browser (ctrl+F5, Apple+r, Command+r, etc)</h3>",
					"",
					null, true,
					function() { window.location.reload(true); }, null
			);
			return false;
		}
		
		// test for browser features
		cache.feature.history = (window.history && window.history.replaceState);
		cache.feature.file = (window.File && window.FileReader && window.FileList);
		cache.feature.storage = (window.localStorage && window.localStorage.getItem && window.localStorage.setItem && window.localStorage.removeItem);
		if (cache.feature.storage) {
			try {
				window.localStorage.setItem('edshipyard_localstorage_test', 'edshipyard_localstorage_test');
				if (window.localStorage.getItem('edshipyard_localstorage_test') !== 'edshipyard_localstorage_test')
					throw 'err';
				window.localStorage.removeItem('edshipyard_localstorage_test');
			} catch (err) {
				cache.feature.storage = false;
			}
		}
		var doc = window.document;
		var docEl = doc.documentElement;
		cache.feature.requestFullscreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
		cache.feature.cancelFullscreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
		
		// initialize cache and UI
		current.beta = true; // TODO: (window.location.pathname.indexOf('/beta/') >= 0);
		initCache();
		initUIShipyardShips();
		initUIShipyardStoredBuilds();
		initUIModulePicker();
		initUIFitSlots();
		initUIDetails();
		
		// set initial UI state
		setUIPageTab('shipyard');
		setUIShipyardTab('ships');
		setUIModuleTab('SLOT');
		updateUIFitColumns();
		
		// register event handlers
		window.addEventListener('resize', onWindowResize);
		if (cache.feature.history)
			window.addEventListener('hashchange', onWindowHashChange);
		document.body.addEventListener('focus', onBodyFocus);
		if (cache.feature.file) {
			document.addEventListener('dragenter', onDocumentDragEnter);
			document.addEventListener('dragover', onDocumentDragOver);
			document.addEventListener('drop', onDocumentDrop);
		}
		for (var f = 0;  f < document.forms.length;  f++)
			document.forms[f].addEventListener('submit', onFormSubmit);
		document.getElementById('window_maximize').addEventListener('click', onUIMaximizeButtonClick);
		document.getElementById('window_minimize').addEventListener('click', onUIMinimizeButtonClick);
		document.getElementById('page_tabs').addEventListener('change', onUIPageHeaderChange);
		document.getElementById('page_body_shipyard').addEventListener('contextmenu', onUIContextMenu);
		document.getElementById('shipyard_tabs').addEventListener('change', onUIShipyardTabChange);
		document.getElementById('shipyard_ships_container').addEventListener('click', onUIShipyardShipsClick);
		document.getElementById('shipyard_storedbuilds_container').addEventListener('click', onUIShipyardStoredBuildsClick);
		document.getElementById('page_body_outfitting').addEventListener('contextmenu', onUIContextMenu);
		document.getElementById('outfitting_modules_tabs').addEventListener('change', onUIModuleTabChange);
		document.getElementById('outfitting_modules_container').addEventListener('change', onUIModulePickerChange);
		document.getElementById('outfitting_modules_container').addEventListener('click', onUIModulePickerClick);
		document.getElementById('outfitting_modules_container').addEventListener('dblclick', onUIModulePickerDblClick);
		//TODO delete document.getElementById('outfitting_modules_container').addEventListener('touchstart', onUIModulePickerTouch);
		//TODO delete document.getElementById('outfitting_modules_container').addEventListener('touchmove', onUIModulePickerTouch);
		//TODO delete document.getElementById('outfitting_modules_container').addEventListener('touchend', onUIModulePickerTouch);
		document.getElementById('outfitting_modules_container').addEventListener('dragstart', onUIModulePickerDragStart);
		document.getElementById('outfitting_modules_container').addEventListener('dragend', onUIModulePickerDragEnd);
		document.getElementById('outfitting_modules_container').addEventListener('drop', onUIModulePickerDrop);
		document.getElementById('outfitting_modules_buttons').addEventListener('click', onUIModuleButtonsClick);
		if (cache.feature.storage) {
			readStoredBuilds();
			updateUIShipyardStoredBuilds();
			readStoredModules();
			updateUIModulePickerStoredModules();
			window.addEventListener('storage', onStorageEvent);
		}
		document.getElementById('outfitting_fit_settings').addEventListener('change', onUIFitSettingsChange);
		document.getElementById('outfitting_fit_settings').addEventListener('click', onUIFitSettingsClick);
		document.getElementById('outfitting_fit_slots').addEventListener('mousedown', onUIFitSlotsMouseDown);
		document.getElementById('outfitting_fit_slots').addEventListener('change', onUIFitSlotsChange);
		document.getElementById('outfitting_fit_slots').addEventListener('click', onUIFitSlotsClick);
		document.getElementById('outfitting_fit_slots').addEventListener('dblclick', onUIFitSlotsDblClick);
		//TODO delete document.getElementById('outfitting_fit_slots').addEventListener('touchstart', onUIFitSlotsTouch);
		//TODO delete document.getElementById('outfitting_fit_slots').addEventListener('touchmove', onUIFitSlotsTouch);
		//TODO delete document.getElementById('outfitting_fit_slots').addEventListener('touchend', onUIFitSlotsTouch);
		document.getElementById('outfitting_fit_slots').addEventListener('dragstart', onUIFitSlotsDragStart);
		document.getElementById('outfitting_fit_slots').addEventListener('dragend', onUIFitSlotsDragEnd);
		document.getElementById('outfitting_fit_slots').addEventListener('drop', onUIFitSlotsDrop);
		document.getElementById('outfitting_details_settings').addEventListener('change', onUIDetailsSettingsChange);
		document.getElementById('outfitting_details_settings').addEventListener('click', onUIDetailsSettingsClick);
		document.getElementById('outfitting_details_module').addEventListener('change', onUIDetailsModuleChange);
		document.getElementById('outfitting_details_buttons').addEventListener('click', onUIDetailsButtonsClick);
		document.getElementById('outfitting_bottom').addEventListener('change', onUIBottomChange);
		document.forms.stats.elements.stats_cur_fuel.addEventListener('wheel', onUIStatsInputWheel);
		document.forms.stats.elements.stats_cur_fuel.addEventListener('change', onUIStatsInputChange);
		document.forms.stats.elements.stats_cur_cargo.addEventListener('wheel', onUIStatsInputWheel);
		document.forms.stats.elements.stats_cur_cargo.addEventListener('change', onUIStatsInputChange);
		document.getElementById('outfitting_fit_crewdist').addEventListener('click', onUIPowerDistClick);
		document.getElementById('outfitting_fit_powerdist').addEventListener('click', onUIPowerDistClick);
		document.getElementById('page_body_options').addEventListener('change', onUIOptionsChange);
		document.getElementById('contact_email').addEventListener('click', onLinkEmailClick);
		
		// check for initial build hash
		if (window.location.hash.length <= 0 || !processURLHash(window.location.hash, true)) {
			current.hashlock = true;
			setCurrentFit(new Build(1, true), '');
			current.hashlock = false;
		}
		updateUIOptions();
		setUIOutfittingPanels('slots',  'slots', 'details');
		
		// after all the current content is finished rendering, check the layout
		updateUIFullscreen();
		setTimeout(updateUILayout, 1);
		setTimeout(updateUIStatsPanels, 1);
	}; // onDOMContentLoaded()
	
	window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
})();
