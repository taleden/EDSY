/*
EDSY was created using assets and imagery from Elite Dangerous, with the permission of Frontier Developments plc, for non-commercial purposes.
It is not endorsed by nor reflects the views or opinions of Frontier Developments and no employee of Frontier Developments was involved in the making of it.

Except where noted otherwise, all design, markup and script code for EDSY is copyright (c) 2015-2023 taleden
and is provided under a Creative Commons Attribution-NonCommercial 4.0 International License (http://creativecommons.org/licenses/by-nc/4.0/).

The Elite Dangerous game logic and data in this file remains the property of Frontier Developments plc, and is used here as authorized by
Frontier Customer Services (https://forums.frontier.co.uk/threads/elite-dangerous-media-usage-rules.510879/).
*/
'use strict';
window.edsy = new (function() {
	var VERSIONS = [308149912,308149912,308149911,308149912]; /* HTML,CSS,DB,JS */
	var LASTMODIFIED = 20230131;
	
	var EMPTY_OBJ = {};
	var EMPTY_ARR = [];
	var EXPERIMENTAL_IMPORT = {};
	var TIMEOUT_RESIZE = 300;
	var TIMEOUT_DBLCLICK = 300;
	var TIMEOUT_LONGPRESS = 500;
	var TOLERANCE_TOUCH = 10;
	var WEAPON_CHARGE = 0.0;
	var GROUPS = ['hardpoint','utility','component','military','internal'];
	var GROUP_LABEL = { hardpoint:'Hardpoints', utility:'Utility Mounts', component:'Core Internal', military:'Military', internal:'Optional Internal' };
	var CORE_SLOT_FDNAME = ['Armour', 'PowerPlant', 'MainEngines', 'FrameShiftDrive', 'LifeSupport', 'PowerDistributor', 'Radar', 'FuelTank'];
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
	var MAX_MALFUNCTION_PWRCAP = 0.4;
	var MIN_MODIFIER = 0.00005;
	var MIN_BPROLL = 0.00025;
//	var BPGRADE_PROGRESS = [0.99, 0.99, 0.65, 0.5, 0.35, 0.25];
	var BPROLL_UPGRADE = 0.8;
//	var BPROLL_LIMIT = 0.95;
	var DISCOUNTS = [30,20,15,10,5,2.5];
	var HASH_VERSION = 17;
	var HTML_ICON = {
		'unknown'    : '<svg class="iconsvg unknown"><use xlink:href="#icon_unknown"/></svg>',
		'ignore'     : '<svg class="iconsvg ignore"><use xlink:href="#icon_ignore"/></svg>',
		'warning'    : '<svg class="iconsvg warning tinted"><use xlink:href="#icon_warning"/></svg>',
		'save'       : '<svg class="iconsvg save"><use xlink:href="#icon_save"/></svg>',
		'saveas'     : '<svg class="iconsvg saveas"><use xlink:href="#icon_saveas"/></svg>',
		'reload'     : '<svg class="iconsvg reload"><use xlink:href="#icon_reload"/></svg>',
		'rename'     : '<svg class="iconsvg rename"><use xlink:href="#icon_rename"/></svg>',
		'delete'     : '<svg class="iconsvg delete"><use xlink:href="#icon_delete"/></svg>',
		'clipboard'  : '<svg class="iconsvg clipboard"><use xlink:href="#icon_clipboard"/></svg>',
		'import'     : '<svg class="iconsvg import"><use xlink:href="#icon_import"/></svg>',
		'export'     : '<svg class="iconsvg export"><use xlink:href="#icon_export"/></svg>',
		'engineer'   : '<svg class="iconsvg engineer"><use xlink:href="#icon_engineer"/></svg>',
		'fixed'      : '<svg class="iconsvg fixed"><use xlink:href="#icon_fixed"/></svg>',
		'gimballed'  : '<svg class="iconsvg gimballed"><use xlink:href="#icon_gimballed"/></svg>',
		'turreted'   : '<svg class="iconsvg turreted"><use xlink:href="#icon_turreted"/></svg>',
		'dumbfire'   : '<svg class="iconsvg dumbfire"><use xlink:href="#icon_dumbfire"/></svg>',
		'seeker'     : '<svg class="iconsvg seeker"><use xlink:href="#icon_seeker"/></svg>',
		'guardian'   : '<svg class="iconsvg guardian tinted"><use xlink:href="#icon_guardian"/></svg>',
		'powerplay'  : '<svg class="iconsvg powerplay tinted"><use xlink:href="#icon_powerplay"/></svg>',
	};
	var HTML_ICON_MOUNT = { F:HTML_ICON['fixed'], G:HTML_ICON['gimballed'], T:HTML_ICON['turreted'] };
	var HTML_ICON_MISSILE = { D:HTML_ICON['dumbfire'], S:HTML_ICON['seeker'] };
	var HTML_ICON_TAG = { G:HTML_ICON['guardian'], P:HTML_ICON['powerplay'] };
	var CSS_FONTS = ['caps','text','fixed'];
	var CSS_COLORS = ['orange','red','blue','green','yellow'];
	var BUILTIN_STORED_MODULES = {
		872200 : { name:"2B Enzyme Missile, HC+Caustic",         modulehash:"FLIqG02G0050ypD4sPc8y00C_00Gu00",                 available:0 }, // CG reward // TODO: get sample to test import
		862500 : { name:"2E/FD AX Missile, HC+RF",               modulehash:"HL3gG-3G_W90zcQ4sPcAhhXEsPcIupDL000P000UxCpWy00", available:1 }, // Sirius tech broker
		863300 : { name:"3C/FD AX Missile, HC+RF",               modulehash:"HL4wG-3G_W90zcQ4sPcAhhXEsPcIupDL000P000UxCpWy00", available:1 }, // Sirius tech broker // TODO: get sample to test import
		881400 : { name:"1D/F Grd Gauss, RF+HC",                 modulehash:"HLXCG-2G0092_166_00A_00Ew7ZHD00L800P600T800YsPc", available:1 }, // Salvation tech broker
		882200 : { name:"2B/F Grd Gauss, RF+HC",                 modulehash:"HLYSG-2G0092_166_00A_00Ew7ZHD00L800P600T800YsPc", available:1 }, // Salvation tech broker
		881430 : { name:"1D/F Grd Plasma, OC+Foc",               modulehash:"HLXFG-2Gxq60vBh4zHx8y00Cw00H800KvLL",             available:1 }, // Salvation tech broker
		882230 : { name:"2B/F Grd Plasma, OC+Foc",               modulehash:"HLYVG-2Gxq60vBh4zHx8y00Cw00H800KvLL",             available:1 }, // Salvation tech broker // TODO: get sample to test import
		881460 : { name:"1D/F Grd Shard, LR+Foc, Pen",           modulehash:"HLXIG-2G0090y0051Cp98HkDFm0H058K_7YP4JAV700YpXv", available:1 }, // Salvation tech broker
		882160 : { name:"2A/F Grd Shard, LR+Foc, Pen",           modulehash:"HLYOG-2G0090y0051Cp98HkDFm0H058K_7YP4JAV700YpXv", available:1 }, // Salvation tech broker // TODO: get sample to test import
	//	882161 : { name:"2A/F Grd Shard, LR5",                   modulehash:"GLYOG02G0080y0051Cp993DDFm0H058L800Op7uV700",     available:0 }, // TODO: CG reward? // TODO: get sample to test import
		811410 : { name:"1D/F Abrasion Blaster, LR",             modulehash:"FJprG02G0062y006y00Ey00Iy00L800P800",             available:0 }, // CG reward // TODO: get sample to test import
		811400 : { name:"1D/F Mining Laser, LR, Incen",          modulehash:"HJpqmF5j3H0072y006y00AkPcEy00I_ezL800PBLL",       available:1 }, // Torval Mining Ltd tech broker
		822230 : { name:"2B Seeker \"V1\", HC+LW, ThermCas",     modulehash:"HK4lG-3Q_W42-Cp6ypDAsPcIwPc",                     available:1 }, // human tech broker
		822231 : { name:"2B Seeker, HC+RF, Drag",                modulehash:"HK4lG-2R00612008u00GwghUsPcX400b400",             available:0 }, // CG reward // TODO: get sample to test import
		722500 : { name:"2E/F Multi-cannon, RF+HC, Phasing",     modulehash:"HHewm1WaCS007Uy00Yuaab600f466n600soPcv400",       available:0 }, // CG reward
		842200 : { name:"2B/F Rail, LR+HC, FeedCas",             modulehash:"FKZyG03I0080-Cp8zCpT000Yyv4b000f000iu00r900",     available:0 }, // CG reward // TODO: get sample to test import
		
		510600 : { name:"0F ECM, LW+Shd",                        modulehash:"FCTqG03G0032_pD50009000",                         available:0 }, // CG reward // TODO: get sample to test import
		520900 : { name:"0I Heat Sink \"Sirius\", ACx2",         modulehash:"HCjwG-2G002P000S_00",                             available:1 }, // Sirus tech broker
		570100 : { name:"0A KWS, FS+LR",                         modulehash:"FDwoG03G0056y008y00GzCpMupDQ_Pc",                 available:0 }, // CG reward // TODO: get sample to test import
		530900 : { name:"0I/T Point Defence, Foc+LW",            modulehash:"FCzYG05G0042_pD6y00GkPcL000",                     available:0 }, // CG reward // TODO: get sample to test import
		
		413100 : { name:"3A Power Plant, AR+OC",                 modulehash:"FA5UG03G0040sPc4-cQ8yAFCqAF",                     available:0 }, // CG reward // TODO: get sample to test import
		413101 : { name:"3A Power Plant, OC",                    modulehash:"HA5UG-7G0036upD8ypDCvcQ",                         available:0 }, // CG reward // TODO: get sample to test import
		414101 : { name:"4A Power Plant, OC",                    modulehash:"HA72G-7G0036upD8ypDCvcQ",                         available:0 }, // CG reward // TODO: get sample to test import
		415101 : { name:"5A Power Plant, OC",                    modulehash:"HA8cG-7G0036upD8ypDCvcQ",                         available:0 }, // CG reward // TODO: get sample to test import
		433100 : { name:"3A FSD, IR+FB",                         modulehash:"HAakG-5G_W60upD6upD8qpDE_PcGzcQKsPc",             available:0 }, // CG reward // TODO: get sample to test import
		434100 : { name:"4A FSD, IR+FB",                         modulehash:"HAcIG-5G_W60upD6upD8qpDE_PcGzcQKsPc",             available:0 }, // CG reward // TODO: get sample to test import
		435100 : { name:"5A FSD \"V1\", IR+FB",                  modulehash:"HAdsG-5G_W60upD6upD8qpDE_PcGzcQKsPc",             available:1 }, // human tech broker
		436100 : { name:"6A FSD, IR+FB",                         modulehash:"HAfQG-5G_W60upD6upD8qpDE_PcGzcQKsPc",             available:0 }, // CG reward // TODO: get sample to test import
		
		  5510 : { name:"5E Anti-Corrosion Cargo (32T)",         modulehash:"H08d00",                                          available:0 }, // CG reward
		  6510 : { name:"6E Anti-Corrosion Cargo (64T)",         modulehash:"H0AB00",                                          available:0 }, // CG reward
		
		303100 : { name:"3A Shield Gen, KR+TR",                  modulehash:"F7PcG05G0044sPc8wPccupDgvcQ",                     available:0 }, // CG reward // TODO: get sample to test import
		111300 : { name:"1I DSS \"V1\", ERx2",                   modulehash:"H2jwG-9G_W1P000",                                 available:1 }, // human tech broker
	};
	
	var cache = {
		attribute: {},
		formatNumText: {},
		formatPctText: {},
		reSpacePercent: new RegExp('[ \u00A0]+(%)'),
		reTrailingPointZero: null,
		reDecimalSep: null,
		reThousandSep: null,
		feature: {},
		ships: [],
		shipBuild: {},
		shipHash: {},
		shipModules: {},
		groupMtypes: {},
		mtypeModules: {},
		mtypeBuiltins: {},
		mtypeSizeGaps: {},
		mtypeBlueprints: {},
		mtypeExpeffects: {},
		moduleHash: {},
		hashVersionMap: {},
		discountMod: {},
		discounts: [],
		option: {},
		template: {},
	};
	var current = {
		dev: false,
		beta: false,
		locale: undefined,
		hashlock: false,
		popup: {
			element: null,
			trigger: null,
			refocus: null,
			sticky: null,
			onOkay: null,
			onCancel: null,
		},
		importdata: {
			imports: null,
			buildlist: null,
			modules: null,
		},
		drag: null,
		resize: null,
		pickerClick: {},
		pickerTouch: {},
		slotsClick: {},
		slotsTouch: {},
		bprollClick: {},
		bprollTouch: {},
		importLabel: {},
		labelImports: {},
		stored: {
			shipNamehashStored: { 0:{} },
			shipStoreds: { 0:[] },
			moduleNamehashStored: { 0:{} },
			moduleStoreds: { 0:[] },
		},
		pickerNameNamehash: {},
		option: {
			insurance: 9500,
			discounts: 0,
			builtin: 'some',
			onlybest: false,
			experimental: false,
			show1: true,
			show2: true,
			show3: true,
			hidestats: true,
			// fonts generated from CSS_FONTS
			// colors generated from CSS_COLORS
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
		analysis_tab: null,
		tableSort: {
			shipyard_ships_table: {},
			shipyard_storedbuilds_table: {},
		},
		counter: {},
		retrofit: null,
	};
	
	
	var
		LN2 = Math.LN2,
		LN10 = Math.LN10,
		PI = Math.PI,
		abs = Math.abs,
		atan2 = Math.atan2,
		ceil = Math.ceil,
		exp = Math.exp,
		floor = Math.floor,
		log = Math.log,
		log2 = Math.log2,
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
	
	
	var populateDOMSelectStoreds = function(select, storeds, namehash, offset) {
		var selectedIndex = (select.selectedIndex ? -1 : 0);
		storeds = storeds || EMPTY_ARR;
		offset = offset || 0;
		setDOMSelectLength(select, offset + storeds.length);
		for (var i = 0;  i < storeds.length;  i++) {
			select.options[offset+i].value = storeds[i].namehash;
			select.options[offset+i].text = storeds[i].name;
			if (storeds[i].namehash === namehash)
				selectedIndex = offset+i;
		}
		select.selectedIndex = selectedIndex;
		return true;
	}; // populateDOMSelectStoreds()
	
	
	var setClipboardString = function(string) {
		var el = document.createElement('textarea');
		el.value = string;
		el.setAttribute('readonly', '');
		el.style.position = 'absolute';
		el.style.left = '-1000px';
		document.body.appendChild(el);
		el.focus();
		el.select();
		var ok = true;
		try {
			document.execCommand('copy');
		} catch (exc) {
			ok = false;
		}
		document.body.removeChild(el);
		return ok;
	}; // setClipboardString()
	
	
	var isDropEffectCopy = function(e) {
		// Fixes browser bug in Chrome on Windows where dropEffect is always "none".
		// The original bug report [1] was merged into another issue [2] but that
		// issue was made private or something because I get permission denied when
		// trying to view it.
		//
		// The fix is to wrap the retrieval of the drop effect and use the current
		// event to determine what the drop effect is.
		//
		// [1]: https://bugs.chromium.org/p/chromium/issues/detail?id=501655
		// [2]: https://bugs.chromium.org/p/chromium/issues/detail?id=39399

		if (e.dataTransfer.dropEffect !== 'none') {
			// Bug hasn't been hit because a drop effect was detected.
			return e.dataTransfer.dropEffect;
		}

		if (e.dataTransfer.effectAllowed !== 'copyMove') {
			// Should never happen. We should only be using this function when we're
			// expecting a copy or move drop event. effectAllowed should have been
			// set when the drag started.
			console.warn('Using isDropEffectCopy() but effectAllowed is not copyMove! (effectAllowed=' + e.dataTransfer.effectAllowed + ')');
			return e.dataTransfer.effectAllowed;
		}

		// This is the actual fix.
		return !!e.ctrlKey;
	} // isDropEffectCopy()
	
	
	var encodeHTML = function(text) {
		return text.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&apos;').replace(/\//g, '&sol;');
	}; // encodeHTML()
	
	
	var getCookie = function(name, defaultvalue) {
		return ((document.cookie.match(new RegExp('(?:^|;)\\s*' + name + '\\s*=\\s*"?([^"\\s;]*)"?\\s*(?:;|$)')) || EMPTY_ARR)[1] || defaultvalue);
	}; // getCookie()
	
	
	var getCookies = function(pattern) {
		var cookies = document.cookie;
		var c = {};
		var re = new RegExp('(?:^|;)\\s*(' + pattern + ')\\s*=\\s*"?([^"\\s;]*)"?', 'g');
		var match;
		while ((match = re.exec(cookies)) !== null) {
			c[match[1]] = match[2];
		}
		return c;
	}; // getCookies()
	
	
	var formatNumText = ((window.Intl && window.Intl.NumberFormat)
		? (
			function(num, dec) {
				return (cache.formatNumText[dec] || (
					cache.formatNumText[dec] = (new window.Intl.NumberFormat(current.locale, { style:'decimal', useGrouping:true,  minimumIntegerDigits:1, minimumFractionDigits:dec, maximumFractionDigits:dec })).format
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
	
	
	var parseNumText = function(text) {
		if (!cache.reDecimalSep) {
			var sep = formatNumText(1.234,3).substring(1,2);
			cache.reDecimalSep = new RegExp('\\' + sep);
			sep = formatNumText(1234,0).substring(1,2);
			if (!sep.match(/\d/))
				cache.reThousandSep = new RegExp('\\' + sep, 'g');
		}
		if (cache.reThousandSep)
			text = text.replace(cache.reThousandSep, '');
		return parseFloat(text.replace(cache.reDecimalSep, '.').trim());
	}; // parseNumText()
	
	
	var formatPctText = ((window.Intl && window.Intl.NumberFormat)
		? (
			function(num, dec) {
				return (cache.formatPctText[dec] || (
					cache.formatPctText[dec] = (new window.Intl.NumberFormat(current.locale, { style:'percent', useGrouping:false,  minimumIntegerDigits:1, minimumFractionDigits:dec, maximumFractionDigits:dec })).format
				))(num).replace(cache.reSpacePercent, '$1');
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
		var text = ((isFinite(num) || isNaN(num)) ? formatNumText(((num === num) ? num : 0), dec) : '&infin;');
		if (num !== num)
			text = '<abbr class="unknown" title="Unknown!">' + text.replace(/0/g,'?') + '</abbr>';
		return text;
	}; // formatNumHTML()
	
	
	var formatPctHTML = function(num, dec) {
		if (num === undefined)
			return '';
		var text = ((isFinite(num) || isNaN(num)) ? formatPctText(((num === num) ? num : 0), dec).replace('%', '<small class="semantic">%</small>') : '&infin;');
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
			if (h) return (((h < 10) ? formatNumText(h+(m/60), 1) : formatNumText(h, 0)) + '<small class="semantic">h</small>');
			if (m) return (((m < 10) ? formatNumText(m+(s/60), 1) : formatNumText(m, 0)) + '<small class="semantic">m</small>');
			return (((h && !m) ? '0<small class="semantic">m</small>' : '') + formatNumText(s, (sec < 10) ? 1 : 0) + '<small class="semantic">s</small>');
		}
		var html = '';
		if (h) html += (formatNumText(h, 0) + '<small class="semantic">h</small>');
		if (m) html += (formatNumText(m, 0) + '<small class="semantic">m</small>');
		if (h && !m) html += '0<small class="semantic">m</small>';
		html += (formatNumText(s, (sec < 10) ? 1 : 0) + '<small class="semantic">s</small>');
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
		return ('<abbr title="' + formatNumHTML(num, 0) + ' CR">' + formatNumText(n, (n < 10) ? 2 : ((n < 100) ? 1 : 0)) + (['',' K',' M',' B',' T'][k] || '') + '</abbr><small>CR</small>');
	}; // formatPriceHTML()
	
	
	var formatAttrLabelHTML = function(attr, abbr, desc) {
		var attribute = (cache.attribute[attr] || EMPTY_OBJ);
		return '<abbr class="attribute" title="' + (desc || attribute.desc || '') + '">' + (abbr || attribute.abbr || attr) + ':</abbr>';
	}; // formatAttrLabelHTML()
	
	
	var formatAttrHTML = function(attr, value, dec) {
		var attribute = (cache.attribute[attr] || EMPTY_OBJ);
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
	
	
	var b64Encode = function(t) {
		return btoa(t).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
	}; // b64Encode()
	
	
	var b64Decode = function(t) {
		return atob((t + '===').slice(0, t.length + ((4 - (t.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
	}; // b64Decode()
	
	
	/*
	* GAME FORMULAS
	*/
	
	
	var getJumpFuelCost = function(mass, dist, fsdOpt, fsdMul, fsdExp, jmpBst) {
		// https://forums.frontier.co.uk/showthread.php?p=643461#post643461
		return fsdMul * pow(max(0, dist - jmpBst) * mass / fsdOpt, fsdExp);
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
	
	
	var getEffectiveDamageResistance = function(baseres, extrares, exemptres, bestres) {
		// https://forums.frontier.co.uk/showthread.php/266235-Kinetic-Resistance-Calculation?p=4230114&viewfull=1#post4230114
		// https://forums.frontier.co.uk/showthread.php/286097-Shield-Booster-Mod-Calculator?p=4998592&viewfull=1#post4998592
		/* old
		var threshold = 30;
		var rawres = 1 - ((1 - baseres / 100) * (1 - extrares / 100));
		var maxres = 1 - ((1 - baseres / 100) * (1 - threshold / 100));
		return 100 * (rawres - max(0, pow((rawres - maxres) / 2, curve || 1)));
		*/
		baseres = baseres || 0;
		extrares = extrares || 0;
		exemptres = exemptres || 0;
		bestres = bestres || 0;
		var lo = max(max(30, baseres), bestres || 0);
		var hi = 65; // half credit past 30% means 100% -> 30 + (100 - 30) / 2 = 65%
		var expected = (1 - ((1 - baseres / 100) * (1 - extrares / 100))) * 100;
		var penalized = lo + (expected - lo) / (100 - lo) * (hi - lo); // remap range [lo..100] to [lo..hi]
		var actual = ((penalized >= 30) ? penalized : expected);
		return (1 - ((1 - exemptres / 100) * (1 - actual / 100))) * 100;
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
		// https://forums.frontier.co.uk/threads/research-detailed-heat-mechanics.286628/post-6399855
		return sqrt(thmload / heatdismax);
	}; // getEquilibriumHeatLevel()
	
	
	var getTimeUntilHeatLevel = function(heatcap, heatdismax, thmload, heatlevel0, heatlevel) {
		// https://forums.frontier.co.uk/threads/research-detailed-heat-mechanics.286628/post-6519883
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
		// https://forums.frontier.co.uk/threads/research-detailed-heat-mechanics.286628/post-6519883
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
		// https://forums.frontier.co.uk/threads/research-detailed-heat-mechanics.286628/post-6408594
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
		this.cost = 0;
		this.powered = true;
		this.priority = 1;
		this.bpid = 0;
		this.bpgrade = 0;
		this.bproll = 0;
		this.expid = 0;
		this.attrModifier = null;
		this.attrOverride = null;
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
		
		
		getSlotSize: function() {
			var ship = eddb.ship[this.build.getShipID()];
			return (ship ? ship.slots[this.slotgroup][this.slotnum] : MAX_SLOT_CLASS);
		}, // getSlotSize()
		
		
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
			var slotsize = this.getSlotSize();
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
			if (this.slotgroup === 'component' && this.slotnum == CORE_ABBR_SLOT.TH && ship.mass > this.getEffectiveAttrValue('engmaxmass')) return false; // ship mass exceeds thruster maximum
			if (this.slotgroup === 'component' && this.slotnum == CORE_ABBR_SLOT.PD && ship.boostcost + BOOST_MARGIN > this.getEffectiveAttrValue('engcap')) return false; // ship boost cost exceeds distributor capacity
			if (this.module.mtype === 'isg' && ship.mass > this.getEffectiveAttrValue('genmaxmass')) return false; // ship mass exceeds shieldgen maximum
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
		
		
		getShipID: function() {
			return this.build.getShipID();
		}, // getShipID()
		
		
		getModuleID: function() {
			return this.modid;
		}, // getModuleID()
		
		
		getModule: function() {
			return this.module;
		}, // getModule()
		
		
		getModuleMtype: function() {
			return (this.module || EMPTY_OBJ).mtype;
		}, // getModuleMtype()
		
		
		setModuleID: function(modid, experimental) {
			if (!(experimental ? this.isModuleIDValid(modid) : this.isModuleIDAllowed(modid)))
				return false;
			this.modid = (modid | 0);
			this.module = ((this.slotgroup === 'ship' && this.slotnum === 'hull') ? eddb.ship[modid] : this.build.getModule(modid));
			this.discounts = 0;
			this.cost = 0;
			this.bpid = 0;
			this.bpgrade = 0;
			this.bproll = 0;
			this.expid = 0;
			this.attrModifier = null;
			this.attrOverride = null;
			this.clearStats();
			return true;
		}, // setModuleID()
		
		
		hasActualCost: function() {
			return (this.cost > 0);
		}, // hasActualCost()
		
		
		getDiscounts: function() {
			return this.discounts;
		}, // getDiscounts()
		
		
		setDiscounts: function(discounts) {
			this.discounts = (this.getBaseCost() ? (discounts & 0x3F) : 0);
			this.cost = 0;
			this.clearStats();
			return true;
		}, // setDiscounts()
		
		
		getBaseCost: function() {
			return this.getBaseAttrValue('cost');
		}, // getBaseCost()
		
		
		getCost: function() {
			return (this.hasActualCost() ? this.cost : this.getEffectiveAttrValue('cost'));
		}, // getCost()
		
		
		setCost: function(cost) {
			cost = parseInt(round(min(max(cost, 0), 9999999999)));
			var base = this.getBaseCost();
			this.discounts = (base ? getClosestDiscount(cost / base) : 0);
			this.cost = cost;
			this.clearStats();
			return true;
		}, // setCost()
		
		
		getPowered: function() {
			return !!this.getPowerLock() || this.powered;
		}, // getPowered()
		
		
		setPowered: function(powered) {
			powered = !!powered;
			if (powered != (!!this.getPowerLock() || powered))
				return false;
			this.powered = powered;
			this.clearStats();
			return true;
		}, // setPowered()
		
		
		getPowerLock: function() {
			return (this.module || EMPTY_OBJ).powerlock;
		}, // getPowerLock()
		
		
		getPriority: function() {
			return this.getPowerLock() || this.priority;
		}, // getPriority()
		
		
		setPriority: function(priority) {
			priority = min(max(priority | 0, 1), MAX_POWER_PRIORITY);
			if (priority != (this.getPowerLock() || priority))
				return false;
			this.priority = priority;
			this.clearStats();
			return true;
		}, // setPriority()
		
		
		changePriority: function(delta) {
			let priority = this.priority;
			if (delta >= 0) {
				priority = (priority + delta - 1) % MAX_POWER_PRIORITY + 1;
			} else {
				priority = ((priority + delta) - delta * MAX_POWER_PRIORITY - 1) % 5 + 1;
			}
			return this.setPriority(priority);
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
					bpgrade = min(max(bpgrade, 1), blueprint.maxgrade);
				}
				this.bpid = bpid;
				this.bpgrade = bpgrade;
				if (bproll) {
					this.bproll = bproll = min(max(bproll, MIN_BPROLL), 1);
					this.attrModifier = {};
					this.attrOverride = {};
					for (var a = 0;  a < mtype.modifiable.length;  a++) {
						var attr = mtype.modifiable[a];
						var attribute = cache.attribute[attr];
						if (attribute && blueprint[attr] && (attribute.modset || attribute.modadd || attribute.modmod || this.getBaseAttrValue(attr))) {
							this.attrModifier[attr] = getBlueprintGradeRollAttrModifier(bpid, bpgrade, bproll, attr);
						}
					}
					// when modifying clip size, round up to a multiple of burst size
					// (this requires applying the ammoclip modifier manually to avoid rounding to step first)
					if (this.attrModifier['ammoclip']) {
						var ammoclip = this.getBaseAttrValue('ammoclip') * (1 + this.attrModifier['ammoclip']);
						var bstsize = this.getEffectiveAttrValue('bstsize');
						this.attrModifier['ammoclip'] = getModuleAttrModifier(this.module, 'ammoclip', ceil(ammoclip / bstsize) * bstsize);
					}
					// when modifying damage falloff, cap at maximum range
					if (this.attrModifier['dmgfall']) {
						var maximumrng = this.getEffectiveAttrValue('maximumrng');
						var dmgfall = this.getEffectiveAttrValue('dmgfall');
						this.attrModifier['dmgfall'] = getModuleAttrModifier(this.module, 'dmgfall', min(maximumrng, dmgfall));
					}
					this.clearStats();
				} else {
					this.bproll = bproll = 0;
					if (this.attrModifier) {
						this.attrOverride = {};
						for (var attr in this.attrModifier)
							this.attrOverride[attr] = true;
					} else {
						this.attrOverride = null;
					}
					this.clearHash();
				}
			} else {
				this.bpid = 0;
				this.bpgrade = 0;
				this.bproll = 0;
				if (bproll) {
					this.attrModifier = null;
					this.attrOverride = null;
					this.clearStats();
				} else {
					if (this.attrModifier) {
						this.attrOverride = {};
						for (var attr in this.attrModifier)
							this.attrOverride[attr] = true;
					} else {
						this.attrOverride = null;
					}
					this.clearHash();
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
			return !!(this.attrModifier || this.expid);
		}, // isModified()
		
		
		getAttrValue: function(attr, modified) {
			switch (attr) {
			case 'fpc':
			case 'sfpc':
				var ammoclip = this.getAttrValue('ammoclip', modified);
				if (ammoclip) {
					// Auto Loader adds 1 round per 2 shots for an almost-but-not-quite +100% effective clip size
					if (modified && this.expid === 'wpnx_aulo')
						ammoclip += ammoclip - 1;
					return ammoclip;
				}
				return this.getAttrValue('bstsize', modified);
				
			case 'spc':
			case 'sspc':
				var dmgmul = this.getAttrValue('dmgmul', modified);
				var duration = this.getAttrValue('duration', modified) * (dmgmul ? WEAPON_CHARGE : 1.0);
				if (this.modid == 84224 && attr === 'sspc') // TODO: bug? Imperial Hammer Rail Gun can keep firing through reloads without re-charging
					duration = 0;
				var bstsize = this.getAttrValue('bstsize', modified);
				var bstrof = this.getAttrValue('bstrof', modified);
				var bstint = this.getAttrValue('bstint', modified);
				var spc = (duration + (bstsize - 1) / bstrof + bstint);
				var ammoclip = this.getAttrValue('ammoclip', modified);
				var rldtime = (attr === 'sspc') ? this.getAttrValue('rldtime', modified) : 0;
				if (ammoclip) {
					// Auto Loader adds 1 round per 2 shots for an almost-but-not-quite +100% effective clip size
					if (modified && this.expid === 'wpnx_aulo')
						ammoclip += ammoclip - 1;
					spc *= ceil(ammoclip / bstsize);
				}
				return spc + max(0, rldtime - duration - bstint);
				
			case 'rof':
				return (this.getAttrValue('fpc', modified) / this.getAttrValue('spc', modified));
				
			case 'srof':
				return (this.getAttrValue('sfpc', modified) / this.getAttrValue('sspc', modified));
				
			case 'dps':
			case 'sdps':
				var damage = this.getAttrValue('damage', modified);
				var dmgmul = (1 + WEAPON_CHARGE * ((this.getAttrValue('dmgmul', modified) || 1) - 1));
				var rounds = this.getAttrValue('rounds', modified);
				var rof = this.getAttrValue((attr === 'sdps') ? 'srof' : 'rof', modified);
				return (damage * dmgmul * rounds * (isFinite(rof) ? rof : 1));
				
			case 'eps':
			case 'seps':
				var distdraw = this.getAttrValue('distdraw', modified);
				var rof = this.getAttrValue((attr === 'seps') ? 'srof' : 'rof', modified);
				return (distdraw * (isFinite(rof) ? rof : 1));
				
			case 'hps':
			case 'shps':
				var thmload = this.getAttrValue('thmload', modified);
				var rof = this.getAttrValue((attr === 'shps') ? 'srof' : 'rof', modified);
				return (thmload * (isFinite(rof) ? rof : 1));
				
			case 'engminmul':
			case 'engoptmul':
			case 'engmaxmul':
				attr = attr.slice(3);
				var spd = this.getAttrValue(attr+'spd', modified);
				var acc = this.getAttrValue(attr+'acc', modified);
				var rot = this.getAttrValue(attr+'rot', modified);
				return (spd + acc + rot) / 3.0;
			}
			
			return getModuleAttrValue(this.module, attr, modified ? this.getEffectiveAttrModifier(attr) : undefined);
		}, // getAttrValue()
		
		
		getBaseAttrValue: function(attr) {
			return this.getAttrValue(attr, false);
		}, // getBaseAttrValue()
		
		
		getEffectiveAttrValue: function(attr) {
			return this.getAttrValue(attr, true);
		}, // getEffectiveAttrValue()
		
		
		isAttrOverridden: function(attr) {
			return !!((this.attrOverride || EMPTY_OBJ)[attr]);
		}, // isAttrOverridden()
		
		
		getAllBaseAttrModifiers: function() {
			if (!this.attrModifier)
				return null;
			var m = {};
			for (var attr in this.attrModifier)
				m[attr] = this.attrModifier[attr];
			return m;
		}, // getAllBaseAttrModifiers()
		
		
		getBaseAttrModifier: function(attr) {
			return ((this.attrModifier || EMPTY_OBJ)[attr] || 0);
		}, // getBaseAttrModifier()
		
		
		getRelatedAttrModifier: function(attr) {
			switch (attr) {
			case 'cost':
				if (!this.hasActualCost())
					return (cache.discountMod[this.discounts] - 1);
				var base = this.getBaseCost();
				var value = this.getCost();
				if (!isFinite(base) || !isFinite(value))
					return 0;
				var modifier = (value / base) - 1;
				return (abs(modifier) < MIN_MODIFIER) ? 0 : modifier; // TODO: check for within 10?
				
			case 'brcdmg':
				return this.getEffectiveAttrModifier('damage');
				
			case 'rof':
			case 'srof':
				// can't just combine modifiers, they're too interrelated
				// instead, compare the derived values with and without modifiers
				var base = this.getAttrValue(attr, false);
				var value = this.getAttrValue(attr, true);
				if (!isFinite(base) || !isFinite(value))
					return 0;
				var modifier = (value / base) - 1;
				return (abs(modifier) < MIN_MODIFIER) ? 0 : modifier;
				
			case 'dps':
			case 'sdps':
				return getAttrModifierSum(attr,
					getAttrModifierSum(attr,
						getAttrModifierSum(attr,
							this.getEffectiveAttrModifier('damage'),
							this.getEffectiveAttrModifier('dmgmul') * WEAPON_CHARGE
						),
						this.getEffectiveAttrModifier('rounds')
					),
					this.getEffectiveAttrModifier(attr === 'sdps' ? 'srof' : 'rof')
				);
				
			case 'eps':
			case 'seps':
				return getAttrModifierSum(attr,
					this.getEffectiveAttrModifier('distdraw'),
					this.getEffectiveAttrModifier(attr === 'seps' ? 'srof' : 'rof')
				);
				
			case 'hps':
			case 'shps':
				return getAttrModifierSum(attr,
					this.getEffectiveAttrModifier('thmload'),
					this.getEffectiveAttrModifier(attr === 'shps' ? 'srof' : 'rof')
				);
				
			case 'shotspd':
				return max(0, this.getEffectiveAttrModifier('maximumrng'));
				
			case 'engminmass':
			case 'engmaxmass':
				// TODO: verify all combinations
				// thrusters legacy negative optmass: negative minmass, negative maxmass
				// thrusters legacy positive optmass:
				// thrusters modern negative optmass: negative minmass, negative maxmass
				// thrusters modern positive optmass: positive minmass, positive maxmass
				return this.getEffectiveAttrModifier('engoptmass');
				
			case 'engminmul':
			case 'engmaxmul':
			case 'minmulspd':
			case 'optmulspd':
			case 'maxmulspd':
			case 'minmulacc':
			case 'optmulacc':
			case 'maxmulacc':
			case 'minmulrot':
			case 'optmulrot':
			case 'maxmulrot':
				return this.getEffectiveAttrModifier('engoptmul');
				
			case 'maxrng':
				return this.getEffectiveAttrModifier('typemis');
				
			case 'genminmass':
				// TODO: verify all combinations
				// shieldgen legacy negative optmass:
				// shieldgen legacy positive optmass:
				// shieldgen modern negative optmass: negative minmass
				// shieldgen modern positive optmass:
				return this.getEffectiveAttrModifier('genoptmass');
				
			case 'genmaxmass':
				// TODO: verify all combinations
				// shieldgen legacy negative optmass:
				// shieldgen legacy positive optmass: positive maxmass
				// shieldgen modern negative optmass: unchanged maxmass
				// shieldgen modern positive optmass:
				return max(0, this.getEffectiveAttrModifier('genoptmass'));
				
			case 'genminmul':
			case 'genmaxmul':
				return this.getEffectiveAttrModifier('genoptmul');
			}
			
			return 0;
		}, // getRelatedAttrModifier()
		
		
		getExperimentalAttrModifier: function(attr) {
			var modExp = ((eddb.expeffect[this.expid] || EMPTY_OBJ)[attr] || 0);
			if (modExp) {
				var attribute = cache.attribute[attr];
				modExp /= ((attribute.modset || attribute.modadd) ? 1 : (attribute.modmod || 100));
			}
			return modExp;
		}, // getExperimentalAttrModifier()
		
		
		getEffectiveAttrModifier: function(attr) {
			// get base, related and experimental modifiers
			var modBase = this.getBaseAttrModifier(attr);
			var modRel = this.getRelatedAttrModifier(attr);
			var modExp = this.getExperimentalAttrModifier(attr);
			
			// apply these modifiers in reverse; usually it doesn't matter, but for modset we want base to override related which overrides experimental
			return getAttrModifierSum(attr, getAttrModifierSum(attr, modExp, modRel), modBase);
		}, // getEffectiveAttrModifier()
		
		
		setEffectiveAttrModifier: function(attr, modifier) {
			if (attr === 'cost') {
				return this.setDiscounts(getClosestDiscount(1 + (modifier || 0)));
			} else if (attr === 'rof' || attr === 'srof') {
				var dmgmul = this.getEffectiveAttrValue('dmgmul');
				var duration = this.getEffectiveAttrValue('duration') * (dmgmul ? WEAPON_CHARGE : 1.0);
				if (this.modid == 84224 && attr === 'srof') // TODO: bug? Imperial Hammer Rail Gun can keep firing through reloads without re-charging
					duration = 0;
				var bstsize = this.getEffectiveAttrValue('bstsize');
				var bstrof = this.getEffectiveAttrValue('bstrof');
				var bstint = this.getBaseAttrValue('bstint');
				var ammoclip = this.getEffectiveAttrValue('ammoclip');
				if (this.expid === 'wpnx_aulo') // Auto Loader adds 1 round per 2 shots for an almost-but-not-quite +100% effective clip size
					ammoclip += max(0, ammoclip - 1);
				var rldtime = (attr === 'srof') ? this.getEffectiveAttrValue('rldtime') : 0;
				var rof = this.getBaseAttrValue('rof');
				// rof * (1 + rofmod) = (ammoclip || bstsize) / ((duration + (bstsize - 1) / bstrof + bstint * (1 + bstintmod)) * ceil((ammoclip || bstsize) / bstsize) + max(0, rldtime - duration - bstint * (1 + bstintmod)))
				// (((ammoclip || bstsize) / (rof * (1 + rofmod)) - max(0, rldtime - duration - bstint * (1 + bstintmod))) / ceil((ammoclip || bstsize) / bstsize) - duration - (bstsize - 1) / bstrof) / bstint - 1 = bstintmod
				attr = 'bstint';
				modifier = (((ammoclip || bstsize) / (rof * (1 + (modifier || 0))) - max(0, rldtime - duration - bstint)) / ceil((ammoclip || bstsize) / bstsize) - duration - (bstsize - 1) / bstrof) / bstint - 1;
				// TODO: how to handle bstint also appearing inside the max() when setting srof?
			}
			
			// get related and experimental modifiers
			var modRel = this.getRelatedAttrModifier(attr);
			var modExp = this.getExperimentalAttrModifier(attr);
			
			// set the base modifier
			var basemodifier = getAttrModifierDifference(attr, modifier, getAttrModifierSum(attr, modExp, modRel));
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
				var dmgmul = this.getBaseAttrValue('dmgmul');
				var duration = this.getBaseAttrValue('duration') * (dmgmul ? WEAPON_CHARGE : 1.0);
				if (this.modid == 84224 && attr === 'srof') // TODO: bug? Imperial Hammer Rail Gun can keep firing through reloads without re-charging
					duration = 0;
				var bstsize = this.getBaseAttrValue('bstsize');
				var bstrof = this.getBaseAttrValue('bstrof');
				var bstint = this.getBaseAttrValue('bstint');
				var ammoclip = this.getBaseAttrValue('ammoclip');
				var rldtime = (attr === 'srof') ? this.getBaseAttrValue('rldtime') : 0;
				var rof = this.getBaseAttrValue('rof');
				// rof * (1 + rofmod) = (ammoclip || bstsize) / ((duration + (bstsize - 1) / bstrof + bstint * (1 + bstintmod)) * ceil((ammoclip || bstsize) / bstsize) + max(0, rldtime - duration - bstint * (1 + bstintmod)))
				// (((ammoclip || bstsize) / (rof * (1 + rofmod)) - max(0, rldtime - duration - bstint * (1 + bstintmod))) / ceil((ammoclip || bstsize) / bstsize) - duration - (bstsize - 1) / bstrof) / bstint - 1 = bstintmod
				attr = 'bstint';
				modifier = (((ammoclip || bstsize) / (rof * (1 + (modifier || 0))) - max(0, rldtime - duration - bstint)) / ceil((ammoclip || bstsize) / bstsize) - duration - (bstsize - 1) / bstrof) / bstint - 1;
				// TODO: how to handle bstint also appearing inside the max() when setting srof?
			}
			// set the modifier (or clear if it's tiny, probably just a rounding error)
			if (!modifier || abs(modifier) < MIN_MODIFIER) {
				if (this.attrModifier) {
					delete this.attrModifier[attr];
					delete this.attrOverride[attr];
					var empty = true;
					for (var key in this.attrModifier) {
						empty = false;
						break;
					}
					if (empty) {
						this.attrModifier = null;
						this.attrOverride = null;
					}
					this.clearStats();
				}
			} else {
				if (getModuleAttrModificationIndex(this.module, attr) < 0)
					return false;
				if (!this.attrModifier)
					this.attrModifier = {};
				this.attrModifier[attr] = getModuleAttrModifier(this.module, attr, getModuleAttrValue(this.module, attr, modifier));
				if (!this.attrOverride)
					this.attrOverride = {};
				this.attrOverride[attr] = true;
				this.clearStats();
			}
			
			return true;
		}, // setAttrModifier()
		
		
		getHash: function(stored) {
			/*
			module hash format (HASH_VERSION=17):
				<3 chars / 18 bits>: module id (0..262143)
				<1 char / 6 bits>: slot flags
					0x20 <bit 1>: costed?
					0x10 <bit 2>: engineered?
					0x08 <bit 3>: powered?
					0x07 <bit 4-6>: priority or powerlock (0..7)
				costed ?
					<1 char / 6 bits>: cost bits
						0x30 <bit 1-2>: number of extra cost chars
						0x0F <bit 3-6>: cost & 0xF
					<3-6 chars / 18-36 bits>: cost >> 4
				!costed ?
					<1 char / 6 bits>: discount bits
				engineered ?
					<2 chars / 12 bits>: engineering flags
						0x800 <bit 1>: unused
						0x780 <bit 2-5>: blueprint index (0..15)
						0x070 <bit 6-8>: blueprint grade (0..7)
						0x00F <bit 9-12>: experimental index (0..15)
					<2 chars / 12 bits: roll * 4000
					<1 char / 6 bits>: number of modified attributes (0..31)
					<4 chars / 24 bits>: modified attribute
						0xF00000 <bit 1-4>: attribute index (0..15)
						0x0FFFFF <bit 5-24>: modifier
					<...>
			*/
			if (!this.module || (this.slotgroup === 'ship' && this.slotnum === 'hull'))
				return '';
			if (!this.hash) {
				var modidhash = hashEncode(this.modid & 0x1FFFF, 3);
				
				var costed = this.hasActualCost();
				var costhash = '';
				if (costed) {
					var cost = this.getCost();
					var costbits = (cost & 0xF);
					cost >>= 4;
					var costsize = min(max(ceil(ceil(log2(cost)) / 6), 2), 5);
					costbits |= (((costsize - 2) & 0x3) << 4);
					costhash = hashEncode(costbits, 1) + hashEncode(cost, costsize);
				} else {
					costhash = hashEncode(this.discounts, 1);
				}
				
				var mtype = (eddb.mtype[this.module.mtype] || EMPTY_OBJ);
				var bpidx = ((mtype.blueprints || EMPTY_ARR).indexOf(this.bpid) + 1);
				var expidx = ((mtype.expeffects || EMPTY_ARR).indexOf(this.expid) + 1);
				var bproll = (((this.bproll * 4000) + 0.5) | 0);
				var nummods = 0;
				var modhash = '';
				if (mtype.modifiable && this.attrModifier) {
					for (var a = 0;  a < mtype.modifiable.length;  a++) {
						var attr = mtype.modifiable[a];
						if (cache.attribute[attr] && this.attrModifier[attr] && this.attrOverride[attr]) {
							nummods++;
							modhash += hashEncode(((a & 0xF) << 20) | (float20Encode(this.attrModifier[attr]) & 0xFFFFF), 4);
						}
					}
				}
				var engbits = (((bpidx & 0xF) << 7) | ((this.bpgrade & 0x7) << 4) | (expidx & 0xF));
				var enghash = ((engbits || nummods) ? (hashEncode(engbits, 2) + hashEncode(bproll, 2) + hashEncode(nummods & 0x1F, 1) + modhash) : '');
				
				var slotbits = ((costed ? 0x20 : 0) | (enghash ? 0x10 : 0) | (this.getPowered() ? 0 : 0x8) | ((this.getPriority() - 1) & 0x7));
				this.hash = (modidhash + hashEncode(slotbits, 1) + costhash + enghash);
				this.storedhash = (hashEncode(HASH_VERSION, 1) + modidhash + hashEncode(slotbits & 0x30, 1) + costhash + enghash);
			}
			return (stored ? this.storedhash : this.hash);
		}, // getHash()
		
		
		getStoredHash: function() {
			return this.getHash(true);
		}, // getStoredHash()
		
		
		setHash: function(hash, version, errors, experimental) {
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
			if (!this.setModuleID(modid, experimental)) {
				if (errors) errors.push(errortag + 'Invalid module id: ' + modid);
				return false;
			} else if (experimental === EXPERIMENTAL_IMPORT && !this.setModuleID(modid)) {
				if (errors) errors.push(errortag + getModuleLabel(this.getModule()) + ' requires Experimental Mode');
			}
			
			// slot bits: costed/discounted, engineered, powered, priority
			var slotbits = ((version >= 8) ? hashDecode(hash.slice(i, (i += 1))) : 0);
			var costed = ((version >= 15) ? (slotbits & 0x20) : 0);
			var discounted = ((version >= 15) ? !costed : ((version >= 14) ? (slotbits & 0x20) : 0));
			var engineered = (slotbits & 0x10);
			var powered = !(slotbits & 0x8);
			var priority = (slotbits & 0x7) + 1;
			// invalid powered/priority is possible for powerlocked modules before v16
			if (!this.setPowered(powered) && (version >= 16 || !this.getPowerLock())) {
				if (errors) errors.push(errortag + 'Invalid powered setting: ' + powered);
			}
			if (!this.setPriority(priority) && (version >= 16 || !this.getPowerLock())) {
				if (errors) errors.push(errortag + 'Invalid power priority setting: ' + priority);
			}
			
			// cost/discount bits
			if (costed) {
				var costbits = hashDecode(hash.slice(i, (i += 1)));
				var cost = hashDecode(hash.slice(i, (i += (((costbits >> 4) & 0x3) + 2))));
				cost = (cost << 4) + (costbits & 0xF);
				if (!this.setCost(cost)) {
					if (errors) errors.push(errortag + 'Invalid cost: ' + cost);
				}
			} else if (discounted) {
				var discounts = hashDecode(hash.slice(i, (i += 1)));
				if (!this.setDiscounts(discounts)) {
					if (errors) errors.push(errortag + 'Invalid discounts: ' + discounts);
				}
			}
			
			// engineering bits
			var mtypeid = (this.module || EMPTY_OBJ).mtype;
			var mtype = (eddb.mtype[mtypeid] || EMPTY_OBJ);
			if (engineered) {
				var engbits = ((version >= 9) ? hashDecode(hash.slice(i, (i += ((version >= 12 && version <= 14) ? 3 : 2)))) : 0);
				var bpidx, bpid, bpgrade, expidx, expid, bproll, nummods;
				if (version >= 15) {
					bpidx = ((engbits >> 7) & 0xF);
					bpid = (idmap.blueprint[mtypeid] || mtype.blueprints || EMPTY_ARR)[bpidx - 1];
					bpgrade = ((engbits >> 4) & 0x7);
					expidx = (engbits & 0xF);
					bproll = hashDecode(hash.slice(i, (i += 2))) / 4000.0;
					nummods = hashDecode(hash.slice(i, (i += 1)));
				} else if (version >= 12) {
					var bprolled = ((version >= 14) ? (engbits & 0x20000) : false);
					bpidx = ((engbits >> 13) & ((version >= 14) ? 0xF : 0x1F));
					bpid = (idmap.blueprint[mtypeid] || mtype.blueprints || EMPTY_ARR)[bpidx - 1];
					bpgrade = ((engbits >> 10) & 0x7);
					expidx = ((engbits >> 5) & 0x1F);
					bproll = (bprolled ? max(MIN_BPROLL, (engbits & 0x1F) * 0.05) : 0);
					nummods = (bprolled ? 0 : (engbits & 0x1F));
				} else {
					bpidx = ((engbits >> 6) & 0x3F);
					bpid = (bpidx ? (idmap.blueprint[mtypeid] || mtype.blueprints || EMPTY_ARR)[((bpidx % 10 + 0.5) | 0)] : 0);
					bpgrade = ((bpidx / 10 + 0.5) | 0);
					expidx = 0;
					bproll = 0;
					nummods = (engbits & 0x3F);
				}
				expid = (idmap.expeffect[mtypeid] || mtype.expeffects || EMPTY_ARR)[expidx - 1];
				
				// convert surface scanner blueprints
				if (version < 13 && mtypeid === 'iss' && bpid && bpgrade > 0) {
					bpid = 'iss_er';
					bpgrade--;
					bproll = 1.0;
					nummods = 0;
				}
				
				// set blueprint, grade, roll
				if (!this.setBlueprint(bpid, bpgrade, bproll)) {
					if (errors) errors.push(errortag + 'Invalid blueprint: '+bpid+' G'+bpgrade+' @'+bproll);
				}
				if (!this.setExpeffectID(expid)) {
					if (errors) errors.push(errortag + 'Invalid experimental effect: '+expid);
				}
				
				// attr mods
				var v9rof = 0;
				while (nummods-- > 0) {
					var attrmod = hashDecode(hash.slice(i, (i += 4)));
					var attr = (mtype.modifiable || EMPTY_ARR)[((attrmod >> 20) & 0xF)];
					var attribute = cache.attribute[attr];
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
			}
			
			this.clearStats();
			return true;
		}, // setHash()
		
		
		setStoredHash: function(modulehash, errors, experimental) {
			var version = hashDecode(modulehash.slice(0,1));
			var powered = this.getPowered();
			var priority = this.getPriority();
			var ok = this.setHash(modulehash.slice(1), version, errors, experimental);
			this.setPowered(powered);
			this.setPriority(priority);
			return ok;
		}, // setStoredHash()
		
		
		exportText: function() {
			var module = this.getModule();
			if (!module)
				return '';
			var buffer = [];
			var tag, line;
			
			// slot tag, module label, powered, priority
			switch (this.getSlotGroup()) {
			case 'hardpoint':  line = 'USMLH'[this.getSlotSize()];        break;
			case 'utility':    line = 'U';                                break;
			case 'component':  line = CORE_SLOT_ABBR[this.getSlotNum()];  break;
			case 'military':   line = 'MC';                               break;
			case 'internal':   line = this.getSlotSize();                 break;
			default:           return '';
			}
			line += ': ' + getModuleLabel(module);
			if (this.getEffectiveAttrValue('pwrdraw'))
				line += ' [' + (this.getPowered() ? '+' : '-') + this.getPriority() + ']';
			buffer.push(line);
			
			// module modification?
			if (this.isModified()) {
				var tag = ((this.getSlotGroup() === 'component' || this.getSlotGroup() === 'military') ? '**: ' : '*: ');
				var blueprint = eddb.blueprint[this.bpid];
				var expeffect = eddb.expeffect[this.expid];
				if (blueprint || expeffect)
					buffer.push(tag + (blueprint ? (blueprint.name + ' ' + this.bpgrade + (this.bproll ? (' ' + formatPctText(this.bproll, 1)) : '')) : '(No Blueprint)') + (expeffect ? (', ' + expeffect.name) : ''));
				// gather relevant attrs: either directly or indirectly modifiable (via expeffect)
				var attrflag = {};
				var modifiable = ((eddb.mtype[this.module.mtype] || EMPTY_OBJ).modifiable || EMPTY_ARR);
				for (var a = 0;  a < modifiable.length;  a++)
					attrflag[modifiable[a]] = true;
				for (var attr in (expeffect || EMPTY_OBJ))
					attrflag[attr] = true;
				// identify modified attrs
				var attrs = [];
				for (var attr in attrflag) {
					if (cache.attribute[attr] && this.getEffectiveAttrModifier(attr)) {
						if (attr === 'damage') {
							attrs.push('dps');
							if (isFinite(this.getBaseAttrValue('rof')))
								attrs.push('damage');
						} else if (attr === 'bstint') {
							attrs.push('dps');
							attrs.push('rof');
						} else {
							attrs.push(attr);
						}
					}
				}
				// sort and export modified attrs
				if (attrs.length > 0) {
					attrs.sort(sortAttributes);
					line = '';
					for (var a = 0;  a < attrs.length;  a++) {
						var attr = attrs[a];
						var text = '; ' + cache.attribute[attr].name + ' ' + getModuleAttrModifierText(module, attr, this.getEffectiveAttrModifier(attr));
						if (line && (line.length + text.length > 65)) {
							buffer.push(tag + line.slice(2));
							line = '';
						}
						line += text;
					}
					if (line)
						buffer.push(tag + line.slice(2));
				}
			}
			
			return buffer.join('\n');
		}, // exportText()
		
		
		exportJournal: function() {
			var ship = eddb.ship[this.build.getShipID()];
			var module = this.getModule();
			if (!ship || !module)
				return null;
			
			var slotsize = this.getSlotSize();
			var slotname = null;
			if (ship.slotnames && ship.slotnames[this.slotgroup]) {
				slotname = ship.slotnames[this.slotgroup][this.slotnum];
			} else {
				switch (this.slotgroup) {
				case 'hardpoint':
					var n = 0;
					for (var s = this.slotnum;  s >= 0;  s--)
						n += (ship.slots.hardpoint[s] == slotsize);
					slotname = (['Tiny','Small','Medium','Large','Huge'][slotsize] || 'Unknown') + 'Hardpoint' + n;
					break;
				case 'utility':
					slotname = 'TinyHardpoint' + (this.slotnum + 1);
					break;
				case 'component':
					slotname = CORE_SLOT_FDNAME[this.slotnum];
					break;
				case 'military':
					slotname = 'Military' + ((this.slotnum < 9) ? '0' : '') + (this.slotnum + 1);
					break;
				case 'internal':
					slotname = 'Slot' + ((this.slotnum < 9) ? '0' : '') + (this.slotnum + 1) + '_Size' + slotsize;
					break;
				default:
					return null;
				}
			}
			
			// slot and module
			var obj = {
				"Slot": slotname,
				"Item": (module.fdname || '').toLowerCase(),
				"On": !!this.getPowered(),
				"Priority": parseInt(this.getPriority() - 1),
				"Value": parseInt(this.getCost()),
			};
			
			// engineering?
			if (this.isModified()) {
				var obj_eng = obj["Engineering"] = {};
				var blueprint = eddb.blueprint[this.bpid];
				if (blueprint) {
					obj_eng["BlueprintName"] = blueprint.fdname;
					obj_eng["Level"] = this.bpgrade;
					obj_eng["Quality"] = (this.bproll ? parseFloat(this.bproll.toFixed(6)) : 0);
				}
				var expeffect = eddb.expeffect[this.expid];
				if (expeffect) {
					obj_eng["ExperimentalEffect"] = expeffect.fdname;
				}
				// gather relevant attrs: either directly or indirectly modifiable (via expeffect)
				var attrflag = {};
				var modifiable = ((eddb.mtype[this.module.mtype] || EMPTY_OBJ).modifiable || EMPTY_ARR);
				for (var a = 0;  a < modifiable.length;  a++)
					attrflag[modifiable[a]] = true;
				for (var attr in (expeffect || EMPTY_OBJ))
					attrflag[attr] = true;
				if (attrflag['damage']) {
					attrflag['dps'] = true;
					if (!isFinite(this.getBaseAttrValue('rof')))
						delete attrflag['damage'];
				}
				if (attrflag['bstint']) {
					attrflag['dps'] = true;
					attrflag['rof'] = true;
				}
				// identify modified attrs
				var attrs = [];
				for (var attr in attrflag) {
					if ((cache.attribute[attr] || EMPTY_OBJ).fdattr && this.getEffectiveAttrModifier(attr))
						attrs.push(attr);
				}
				// sort and export modified attrs
				if (attrs.length > 0) {
					attrs.sort(sortAttributes);
					var obj_eng_mod = obj_eng["Modifiers"] = [];
					for (var a = 0;  a < attrs.length;  a++) {
						obj_eng_mod.push({
							"Label": cache.attribute[attrs[a]].fdattr,
							"Value": parseFloat(this.getEffectiveAttrValue(attrs[a]).toFixed(6)),
							"OriginalValue": parseFloat(this.getBaseAttrValue(attrs[a]).toFixed(6)),
						});
					}
				}
			}
			
			return obj;
		}, // exportJournal()
		
		
		exportEDOMH: function() {
			var ship = eddb.ship[this.build.getShipID()];
			var module = this.getModule();
			var blueprint = eddb.blueprint[this.bpid];
			if (!ship || !module || !this.isModified() || !blueprint || !this.bproll)
				return null;
			
			var obj = {
				"item": (module.fdname || '').toLowerCase(),
				"blueprint": (blueprint.fdname || '').toLowerCase(),
				"grade": this.bpgrade,
				"highestGradePercentage": (this.bproll ? parseFloat(this.bproll.toFixed(6)) : 0),
			}
			
			var expeffect = eddb.expeffect[this.expid];
			if (expeffect) {
				obj["experimental"] = (expeffect.fdname || '').toLowerCase();
			}
			
			return obj;
		}, // exportEDOMH()
		
	}; // Slot.prototype
	
	
	Slot.getModuleIDStoredHash = function(modid) {
		// HASH_VERSION=17
		return (hashEncode(HASH_VERSION, 1) + hashEncode(modid & 0x1FFFF, 3) + hashEncode(0, 2)); // slotbits(!costed), discountbits
	}; // getModuleIDStoredHash()
	
	
	Slot.getStoredHashModuleID = function(modulehash) {
		var version = hashDecode(modulehash.slice(0,1));
		if (version < 9)
			return null;
		var idmap = Build.getHashVersionMap(version);
		var modid = hashDecode(modulehash.slice(1, 4));
		return (idmap.module[modid] || modid);
	}; // getStoredHashModuleID()
	
	
	Slot.getRetrofitData = function(slot1, slot2, modidNum, limdisc, limdisceng, limbpgrade, limbproll, limexpeffect, limrolls) {
		var steps = [];
		
		// gather attributes
		var sgrp1 = slot1 ? slot1.getSlotGroup() : null;
		var sgrp2 = slot2 ? slot2.getSlotGroup() : null;
		if (sgrp1 && sgrp2 && (sgrp1 === 'ship') !== (sgrp2 === 'ship'))
			return null;
		var shipid1 = slot1 ? slot1.getShipID() : 0;
		var shipid2 = slot2 ? slot2.getShipID() : 0;
		var modid1 = slot1 ? slot1.getModuleID() : 0;
		var modid2 = slot2 ? slot2.getModuleID() : 0;
		var discmod1 = slot1 ? cache.discountMod[slot1.getDiscounts()] : 1;
		var discmod2 = slot2 ? cache.discountMod[slot2.getDiscounts()] : 1;
		var bpid1 = slot1 ? slot1.getBlueprintID() : '';
		var bpid2 = slot2 ? slot2.getBlueprintID() : '';
		var bpgrade1 = slot1 ? slot1.getBlueprintGrade() : 0;
		var bpgrade2 = slot2 ? slot2.getBlueprintGrade() : 0;
		var bproll1 = slot1 ? slot1.getBlueprintRoll() : 0;
		var bproll2 = slot2 ? slot2.getBlueprintRoll() : 0;
		var expid1 = slot1 ? slot1.getExpeffectID() : '';
		var expid2 = slot2 ? slot2.getExpeffectID() : '';
		
		// increment module tallies
		if (modid1 && sgrp1 !== 'ship')
			modidNum[modid1] = (modidNum[modid1] || 0) + 1;
		if (modid2 && sgrp2 !== 'ship' && modid1 != modid2)
			modidNum[modid2] = (modidNum[modid2] || 0) + 1;
		
		// if we have an old module and it's different, or it's insufficiently discounted and not too engineered, sell it
		if (modid1) {
			if ((modid1 != modid2) || (discmod1 > max(cache.discountMod[limdisc], discmod2) && (!bpid2 || bpid1 != bpid2 || bpgrade1 <= limdisceng))) {
				steps.push({ sgrp:sgrp1, sid:shipid1, mid:((sgrp1 === 'ship') ? 0 : modid1), num:modidNum[modid1], act:'Sell', discmod:discmod1, desc:(formatPctText(1 - discmod1, 1) + ' discount'), cost:{'':-slot1.getCost()} });
				slot1 = null;
				modid1 = bpgrade1 = bproll1 = 0;
				bpid1 = expid1 = '';
			}
		}
		
		// if we have a new module, ...
		if (modid2) {
			// if we have no matching old module, buy one
			if (modid1 != modid2) {
				steps.push({ sgrp:sgrp2, sid:shipid2, mid:((sgrp2 === 'ship') ? 0 : modid2), num:modidNum[modid2], act:'Buy', discmod:discmod2, desc:(formatPctText(1 - discmod2, 1) + ' discount'), cost:{'':slot2.getCost()} });
				modid1 = modid2;
				bpgrade1 = bproll1 = 0;
				bpid1 = expid1 = '';
			}
			
			// if we have a blueprint, roll it up
			var blueprint = eddb.blueprint[bpid2];
			if (blueprint) {
				if (bpid1 != bpid2) {
					bpid1 = bpid2;
					bpgrade1 = 1;
					bproll1 = 0;
					expid1 = '';
				} else if (bproll1 <= 0) {
					steps.push({ sgrp:sgrp2, sid:shipid2, mid:((sgrp2 === 'ship') ? 0 : modid2), num:modidNum[modid2], act:'Conv', bpid:bpid1, bpgrade:bpgrade1, desc:(blueprint.name + ' G' + bpgrade1 + ' (legacy)'), cost:{} });
					bpgrade1--;
					bproll1 = 1;
				}
				while (bpgrade1 <= min(limbpgrade, bpgrade2)) {
					var limit = ((bpgrade1 < min(limbpgrade, bpgrade2)) ? BPROLL_UPGRADE : min(limbproll, bproll2));
					if (bproll1 <= 0 || bproll1 < limit) {
					//	var rolls = max(1, round(2 * log((1 - limit) / (1 - bproll1)) / log(1 - BPGRADE_PROGRESS[bpgrade1])) / 2);
						var rolls = max(1, round(2 * (limit - bproll1) * limrolls[bpgrade1]) / 2);
						var mats = blueprint.mats[bpgrade1 - 1];
						var cost = {};
						for (var mat in mats)
							cost[mat] = rolls * mats[mat];
						steps.push({ sgrp:sgrp2, sid:shipid2, mid:((sgrp2 === 'ship') ? 0 : modid2), num:modidNum[modid2], act:'Eng', bpid:bpid2, bpgrade:bpgrade1, bproll:limit, rolls:rolls, desc:(blueprint.name + ' G' + bpgrade1 + ' x' + rolls), cost:cost });
					}
					bpgrade1++;
					bproll1 = 0;
				}
			}
			
			// if we have an experimental, apply it
			var expeffect = eddb.expeffect[expid2];
			var mtype2 = (slot2.getSlotGroup() === 'hardpoint') ? 'wpn' : slot2.getModuleMtype();
			if (expeffect && expid1 != expid2 && limexpeffect !== '' && (limexpeffect === 'all' || (','+limexpeffect+',').indexOf(mtype2) != -1)) {
				var cost = clone({}, expeffect.mats);
				steps.push({ sgrp:sgrp2, sid:shipid2, mid:((sgrp2 === 'ship') ? 0 : modid2), num:modidNum[modid2], act:'Exp', expid:expid2, desc:expeffect.name, cost:cost });
			}
		}
		
		return steps;
	}; // getRetrofitData()
	
	
	var Build = function(shipid, stock) {
		var ship = eddb.ship[shipid];
		if (!ship)
			throw 'invalid ship id #' + shipid;
		this.hash = null;
		this.stats = null;
		this.shipid = shipid;
		this.name = '';
		this.nametag = '';
		this.inaraAcct = null;
		this.inaraShip = null;
		this.crewdist = { sys:0, eng:0, wep:0 };
		this.powerdist = { sys:4, eng:4, wep:4 };
		this.slots = {
			ship : {
				hull  : new Slot(this, 'ship', 'hull', shipid),
				hatch : new Slot(this, 'ship', 'hatch', SHIP_HATCH_ID),
			},
		};
		this.slots.ship.hull.setDiscounts(current.option.discounts);
		for (var slotgroup in ship.slots) {
			this.slots[slotgroup] = [];
			for (var slotnum = 0;  slotnum < ship.slots[slotgroup].length;  slotnum++) {
				var modid = ((slotgroup === 'component' || stock) ? ship.stock[slotgroup][slotnum] : 0);
				var discounts = current.option.discounts;
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
			return this.name || '';
		}, // getName()
		
		
		setName: function(name) {
			this.name = (name || '').slice(0,22);
			this.clearHash();
			return true;
		}, // setName()
		
		
		getNameTag: function() {
			return this.nametag || '';
		}, // getNameTag()
		
		
		setNameTag: function(nametag) {
			this.nametag = (nametag || '').slice(0,6);
			this.clearHash();
			return true;
		}, // setNameTag()
		
		
		getInaraURL: function() {
			if (!this.inaraAcct || !this.inaraShip)
				return null;
			return ('https://inara.cz/cmdr-fleet/'+this.inaraAcct+'/'+this.inaraShip+'/');
		}, // getInaraURL()
		
		
		setInaraXref: function(acct, ship) {
			acct = acct ? parseInt(acct) : null;
			ship = ship ? parseInt(ship) : null;
			if ((acct || ship) && (isNaN(acct) || acct < 1 || isNaN(ship) || ship < 1))
				return false;
			this.inaraAcct = acct;
			this.inaraShip = ship;
			return true;
		}, // setInaraXref()
		
		
		getEDDBioURL: function() {
			var sid = this.getShipID();
			
			// pre-flag stock modules that will come with the ship anyway
			var ship = eddb.ship[sid];
			var idFlag = {};
			for (var slotgroup in this.slots) {
				if (slotgroup !== 'ship') {
					for (var slotnum = 0;  slotnum < ship.slots[slotgroup].length;  slotnum++) {
						var mid = abs(ship.stock[slotgroup][slotnum]);
						var module = cache.shipModules[sid][mid] || eddb.module[mid];
						var eddbid = module ? module.eddbid : 0;
						if (eddbid) {
							idFlag[eddbid] = true;
						}
					}
				}
			}
			
			// identify all other modules in this build
			var idList = [];
			for (var slotgroup in this.slots) {
				if (slotgroup !== 'ship') {
					var slot;
					for (var slotnum = 0;  slot = this.getSlot(slotgroup, slotnum);  slotnum++) {
						var mid = slot.getModuleID();
						var module = cache.shipModules[sid][mid] || eddb.module[mid];
						if (module && module.eddbid && !idFlag[module.eddbid] && module.tag !== 'P') {
							idFlag[module.eddbid] = true;
							idList.push(module.eddbid);
						}
					}
				}
			}
			return ('https://eddb.io/station?m=' + idList.join(',') + (eddb.ship[sid].eddbid ? ('&s=' + eddb.ship[sid].eddbid) : ''));
		}, // getEDDBioURL()
		
		
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
			// TODO: eng drains wep first in a tie? S,E,E,E -> 2,4,0 not 1.5,4,0.5
			this.powerdist.sys = sys = min(max(sys | 0, 0                                           ), MAX_POWER_DIST);
			this.powerdist.eng = eng = min(max(eng | 0, 0, (TOTAL_POWER_DIST - MAX_POWER_DIST) - sys), MAX_POWER_DIST, TOTAL_POWER_DIST - sys);
			this.powerdist.wep = TOTAL_POWER_DIST - sys - eng;
			this.clearStats();
			return true;
		}, // setPowerDist()
		
		
		changePowerDist: function(dist0, delta) {
			// TODO: eng drains wep first in a tie? S,E,E,E -> 2,4,0 not 1.5,4,0.5
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
			if (!slot2.setHash(slot1.getHash(), HASH_VERSION, null, current.option.experimental))
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
				pwrbst: 0,
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
				ammotime_wepcap: 1/0,
				ammotime_nocap: 1/0,
				wepcap_burst_cur: 0,
				wepcap_burst_max: 0,
				wepchg_sustain_cur: 0,
				wepchg_sustain_max: 0,
				lmprepcap_max: 0,
				unlimit: {},
			};
			var kinmod_ihrp = 1;
			var thmmod_ihrp = 1;
			var expmod_ihrp = 1;
			var caumod_ihrp = 1;
			var kinmin_ihrp = 1;
			var thmmin_ihrp = 1;
			var expmin_ihrp = 1;
			var caumin_ihrp = 1;
			var kinmod_usb = 1;
			var thmmod_usb = 1;
			var expmod_usb = 1;
			var caumod_usb = 1;
			
			// ship hull
			var slot_hull = this.getSlot('ship', 'hull');
			stats.cost += slot_hull.getCost();
			stats.mass += slot_hull.getEffectiveAttrValue('mass');
			
			// cargo hatch
			var slot = this.getSlot('ship', 'hatch');
			stats.cost += slot.getCost();
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
			var weapons = [];
			var slot_isg = null;
			for (var slotgroup in GROUP_LABEL) {
				for (var slotnum = 0;  slot = this.getSlot(slotgroup, slotnum);  slotnum++) {
					if (module = slot.getModule()) {
						var mtypeid = module.mtype;
						stats.cost += slot.getCost();
						stats.cost_vehicle += slot.getEffectiveAttrValue('vslots') * slot.getEffectiveAttrValue('vcount') * (slot.getEffectiveAttrValue('ammocost') || 0);
						stats.mass += slot.getEffectiveAttrValue('mass');
						stats.pwrcap += slot.getEffectiveAttrValue('pwrcap');
						stats.pwrbst += slot.getEffectiveAttrValue('pwrbst');
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
							stats.cost_restock += slot.getEffectiveAttrValue('afmrepcap') * (slot.getEffectiveAttrValue('ammocost') || 0);
						} else if (mtypeid === 'imrp') {
							stats.integ_imrp += slot.getEffectiveAttrValue('integ');
							stats.dmgprot *= (1 - (slot.getEffectiveAttrValue('dmgprot') / 100));
						} else if (mtypeid === 'ihrp' || mtypeid === 'imahrp') {
							var kinmod = (1 - (slot.getEffectiveAttrValue('kinres') / 100));
							var thmmod = (1 - (slot.getEffectiveAttrValue('thmres') / 100));
							var expmod = (1 - (slot.getEffectiveAttrValue('expres') / 100));
							var caumod = (1 - (slot.getEffectiveAttrValue('caures') / 100));
							kinmod_ihrp *= kinmod;
							thmmod_ihrp *= thmmod;
							expmod_ihrp *= expmod;
							caumod_ihrp *= caumod;
							kinmin_ihrp = min(kinmin_ihrp, kinmod);
							thmmin_ihrp = min(thmmin_ihrp, thmmod);
							expmin_ihrp = min(expmin_ihrp, expmod);
							caumin_ihrp = min(caumin_ihrp, caumod);
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
							
							if (slotgroup === 'hardpoint') {
								var thmload = slot.getEffectiveAttrValue('thmload');
								var distdraw = slot.getEffectiveAttrValue('distdraw');
								var ammoclip = slot.getEffectiveAttrValue('ammoclip');
								var ammomax = slot.getEffectiveAttrValue('ammomax');
								var eps = slot.getEffectiveAttrValue('eps');
								var seps = slot.getEffectiveAttrValue('seps');
								var spc = slot.getEffectiveAttrValue('spc') || 1;
								var sspc = slot.getEffectiveAttrValue('sspc') || 1;
								var sfpc = slot.getEffectiveAttrValue('sfpc');
								var sdps = slot.getEffectiveAttrValue('sdps');
								
								thmload *= sfpc / sspc;
								stats.thmload_hardpoint_wepfull += getEffectiveWeaponThermalLoad(thmload, distdraw, wepcap, 1.0);
								stats.thmload_hardpoint_wepempty += getEffectiveWeaponThermalLoad(thmload, distdraw, wepcap, 0.0);
								
								stats.dps += sdps;
								stats.dps_abs += sdps * (slot.getEffectiveAttrValue('abswgt') / 100.0);
								stats.dps_thm += sdps * (slot.getEffectiveAttrValue('thmwgt') / 100.0);
								stats.dps_kin += sdps * (slot.getEffectiveAttrValue('kinwgt') / 100.0);
								stats.dps_exp += sdps * (slot.getEffectiveAttrValue('expwgt') / 100.0);
								stats.dps_axe += sdps * (slot.getEffectiveAttrValue('axewgt') / 100.0);
								stats.dps_cau += sdps * (slot.getEffectiveAttrValue('cauwgt') / 100.0);
								
								weapons.push( {key:spc, spc:spc, eps:eps, seps:seps} );
								var ammotime = ammoclip ? (sspc * ((ammoclip + ammomax) / sfpc)) : 1/0;
								if (distdraw) {
									stats.dps_distdraw += sdps;
									stats.ammotime_wepcap = min(stats.ammotime_wepcap, ammotime);
								} else {
									stats.dps_nodistdraw += sdps;
									stats.ammotime_nocap = min(stats.ammotime_nocap, ammotime);
								}
							} else if (mtypeid === 'usb') {
								kinmod_usb *= (1 - (slot.getEffectiveAttrValue('kinres') / 100));
								thmmod_usb *= (1 - (slot.getEffectiveAttrValue('thmres') / 100));
								expmod_usb *= (1 - (slot.getEffectiveAttrValue('expres') / 100));
								caumod_usb *= (1 - (slot.getEffectiveAttrValue('caures') / 100));
							} else if (mtypeid === 'ct') {
								stats.thmload_ct += slot.getEffectiveAttrValue('engheat');
							} else if (mtypeid === 'cfsd') {
								stats.thmload_cfsd += slot.getEffectiveAttrValue('fsdheat');
							} else if (mtypeid === 'idlc' || mtypeid === 'imlc' || mtypeid === 'irlc') {
								stats.lmprepcap_max = max(stats.lmprepcap_max, slot.getEffectiveAttrValue('lmprepcap'));
							} else if (mtypeid === 'iex') {
								stats.unlimit[module.unlimit] = (stats.unlimit[module.unlimit] || 0) + (module.unlimitcount || 0);
							} else if (mtypeid === 'iscb') {
								var scbheat = slot.getEffectiveAttrValue('scbheat');
								var spinup = slot.getEffectiveAttrValue('spinup');
								stats.thmload_iscb += scbheat / spinup;
								stats.spinup_iscb = max(stats.spinup_iscb, spinup);
								
								var shieldrnfps = (slot.getEffectiveAttrValue('scbdur') * slot.getEffectiveAttrValue('shieldrnfps'));
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
			var optmass = slot.getEffectiveAttrValue('fsdoptmass');
			var maxfuel = slot.getEffectiveAttrValue('maxfuel');
			var fuelmul = slot.getEffectiveAttrValue('fuelmul');
			var fuelpower = slot.getEffectiveAttrValue('fuelpower');
			stats._jump_laden    = getJumpDistance(            stats.mass + stats.fuelcap + stats.cargocap, min(stats.fuelcap, maxfuel), optmass, fuelmul, fuelpower, stats.jumpbst);
			stats._jump_unladen  = getJumpDistance(            stats.mass + stats.fuelcap                 , min(stats.fuelcap, maxfuel), optmass, fuelmul, fuelpower, stats.jumpbst);
			stats._jump_max      = getJumpDistance(            stats.mass + min(stats.fuelcap, maxfuel)   , min(stats.fuelcap, maxfuel), optmass, fuelmul, fuelpower, stats.jumpbst);
			stats._range_laden   = getJumpRange(stats.fuelcap, stats.mass + stats.fuelcap + stats.cargocap, min(stats.fuelcap, maxfuel), optmass, fuelmul, fuelpower, stats.jumpbst);
			stats._range_unladen = getJumpRange(stats.fuelcap, stats.mass + stats.fuelcap                 , min(stats.fuelcap, maxfuel), optmass, fuelmul, fuelpower, stats.jumpbst);
			
			// derived Thruster stats
			var boostcost = slot_hull.getEffectiveAttrValue('boostcost');
			var topspd = slot_hull.getEffectiveAttrValue('topspd');
			var bstspd = slot_hull.getEffectiveAttrValue('bstspd');
			var slot = this.getSlot('component', CORE_ABBR_SLOT.PD);
			var engcap = slot.getEffectiveAttrValue('engcap');
			var slot = this.getSlot('component', CORE_ABBR_SLOT.TH);
			var minmass = slot.getEffectiveAttrValue('engminmass');
			var optmass = slot.getEffectiveAttrValue('engoptmass');
			var maxmass = slot.getEffectiveAttrValue('engmaxmass');
			var minmulspd = slot.getEffectiveAttrValue('minmulspd');
			var optmulspd = slot.getEffectiveAttrValue('optmulspd');
			var maxmulspd = slot.getEffectiveAttrValue('maxmulspd');
			var effmulspd = (getMassCurveMultiplier(stats.mass + stats.fuelcap, minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd) / 100);
			stats._speed = (topspd * effmulspd);
			stats._boost = ((engcap > boostcost + BOOST_MARGIN) ? (bstspd * effmulspd) : 0);
			
			// derived Shield stats
			var mass_hull = slot_hull.getEffectiveAttrValue('mass');
			var shields = slot_hull.getEffectiveAttrValue('shields');
			var maxmass = (slot_isg ? slot_isg.getEffectiveAttrValue('genmaxmass') : 0);
			if (slot_isg && maxmass >= mass_hull) {
				var minmass = slot_isg.getEffectiveAttrValue('genminmass');
				var optmass = slot_isg.getEffectiveAttrValue('genoptmass');
				var minmul = slot_isg.getEffectiveAttrValue('genminmul');
				var optmul = slot_isg.getEffectiveAttrValue('genoptmul');
				var maxmul = slot_isg.getEffectiveAttrValue('genmaxmul');
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
				stats._skinres = getEffectiveDamageResistance(0, (1 - kinmod_usb) * 100, kinres);
				stats._sthmres = getEffectiveDamageResistance(0, (1 - thmmod_usb) * 100, thmres);
				stats._sexpres = getEffectiveDamageResistance(0, (1 - expmod_usb) * 100, expres);
				stats._scaures = getEffectiveDamageResistance(0, (1 - caumod_usb) * 100, caures);
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
			stats._akinres = getEffectiveDamageResistance(kinres, (1 - kinmod_ihrp) * 100, 0, (1 - kinmin_ihrp) * 100);
			stats._athmres = getEffectiveDamageResistance(thmres, (1 - thmmod_ihrp) * 100, 0, (1 - thmmin_ihrp) * 100);
			stats._aexpres = getEffectiveDamageResistance(expres, (1 - expmod_ihrp) * 100, 0, (1 - expmin_ihrp) * 100);
			stats._acaures = getEffectiveDamageResistance(caures, (1 - caumod_ihrp) * 100, 0, (1 - caumin_ihrp) * 100);
			
			// derived Weapon stats
			var slot = this.getSlot('component', CORE_ABBR_SLOT.PD);
			var wepcap = slot.getEffectiveAttrValue('wepcap');
			var wepchg = slot.getEffectiveAttrValue('wepchg');
			var powerdist_wep = this.getEffectivePowerDist('wep');
			var powerdistWepMul = pow(powerdist_wep / MAX_POWER_DIST, 1.1);
			weapons.sort(sortObjKeyAsc);
			var eps = 0;
			var seps = 0;
			for (var i = 0;  i < weapons.length;  i++) {
				eps += weapons[i].eps;
				seps += weapons[i].seps;
			}
			var eps_cur = eps;
			var eps_max = eps;
			stats.wepcap_burst_cur = (wepcap / max(0, eps_cur - wepchg * powerdistWepMul));
			stats.wepcap_burst_max = (wepcap / max(0, eps_max - wepchg));
			for (var i = 0;  i < weapons.length;  i++) {
				if (stats.wepcap_burst_cur >= weapons[i].spc) {
					eps_cur = eps_cur - weapons[i].eps + weapons[i].seps;
					stats.wepcap_burst_cur = (wepcap / max(0, eps_cur - wepchg * powerdistWepMul));
				}
				if (stats.wepcap_burst_max >= weapons[i].spc) {
					eps_max = eps_max - weapons[i].eps + weapons[i].seps;
					stats.wepcap_burst_max = (wepcap / max(0, eps_max - wepchg));
				}
			}
			stats.wepchg_sustain_cur = min(max(wepchg * powerdistWepMul / seps, 0), 1);
			stats.wepchg_sustain_max = min(max(wepchg                   / seps, 0), 1);
		}, // updateStats()
		
		
		getStat: function(stat) {
			if (!this.stats)
				this.updateStats();
			return this.stats[stat];
		}, // getStat()
		
		
		getRetrofitData: function(base, limdisc, limdisceng, limbpgrade, limbproll, limexpeffect, limrolls) {
			if (!base) {
				base = new Build(this.getShipID(), true);
			}
			
			// collect slots for each group (but combine military with internal for this purpose)
			var groupSlots1 = {};
			var groupSlots2 = {};
			for (var slotgroup in GROUP_LABEL) {
				var compgroup = ((slotgroup === 'military') ? 'internal' : slotgroup);
				groupSlots1[compgroup] = groupSlots1[compgroup] || [];
				groupSlots2[compgroup] = groupSlots2[compgroup] || [];
				var slot;
				for (var slotnum = 0;  slot = base.getSlot(slotgroup, slotnum);  slotnum++) {
					if (slot.getModule())
						groupSlots1[compgroup].push(slot);
				}
				for (var slotnum = 0;  slot = this.getSlot(slotgroup, slotnum);  slotnum++) {
					if (slot.getModule())
						groupSlots2[compgroup].push(slot);
				}
			}
			
			// sort and compare slot-modules
			var slot1 = base.getSlot('ship', 'hull');
			var slot2 = this.getSlot('ship', 'hull');
			var modidNum = {};
			var steps = Slot.getRetrofitData(slot1, slot2, modidNum, limdisc, limdisceng, limbpgrade, limbproll, limexpeffect, limrolls);
			for (var g = 0;  g < GROUPS.length;  g++) {
				var slotgroup = GROUPS[g];
				if (slotgroup === 'military')
					continue;
				groupSlots1[slotgroup].sort(sortSlotModules);
				groupSlots2[slotgroup].sort(sortSlotModules);
				var slotnum1 = 0;
				var slotnum2 = 0;
				var groupsteps = [];
				var groupsales = [];
				do {
					var slot1 = groupSlots1[slotgroup][slotnum1];
					var slot2 = groupSlots2[slotgroup][slotnum2];
					if (slot1 && slot2 && (slot1.getModuleID() == slot2.getModuleID() || (slotgroup === 'component' && slotnum1 === slotnum2))) {
						Array.prototype.push.apply(groupsteps, Slot.getRetrofitData(slot1, slot2, modidNum, limdisc, limdisceng, limbpgrade, limbproll, limexpeffect, limrolls));
						slotnum1++;
						slotnum2++;
					} else if (slot1 && (!slot2 || sortSlotModules(slot1, slot2) < 0)) {
						Array.prototype.push.apply(groupsales, Slot.getRetrofitData(slot1, null, modidNum, limdisc, limdisceng, limbpgrade, limbproll, limexpeffect, limrolls));
						slotnum1++;
					} else if (slot2 && (!slot1 || sortSlotModules(slot1, slot2) > 0)) {
						Array.prototype.push.apply(groupsteps, Slot.getRetrofitData(null, slot2, modidNum, limdisc, limdisceng, limbpgrade, limbproll, limexpeffect, limrolls));
						slotnum2++;
					} else if (!slot1 && !slot2) {
						break;
					} else {
						console.log('retrofit error: slot '+slot1+' vs '+slot2);
						slotnum1++;
						slotnum2++;
					}
				} while (true);
				Array.prototype.push.apply(steps, groupsales);
				Array.prototype.push.apply(steps, groupsteps);
			}
			
			// clear extraneous '#1's for modules that only appear once
			for (var i = 0;  i < steps.length;  i++) {
				if (steps[i].sgrp !== 'ship' && steps[i].num == 1 && modidNum[steps[i].mid] == 1)
					steps[i].num = 0;
			}
			
			return steps;
		}, // getRetrofitData()
		
		
		getHash: function() {
			if (!this.hash) {
				var slot = this.getSlot('ship', 'hull');
				var cost = (slot.hasActualCost() ? slot.getCost() : 0);
				var costbits = (cost & 0xF);
				cost >>= 4;
				var costsize = min(max(ceil(ceil(log2(cost)) / 6), 2), 5);
				costbits |= (((costsize - 2) & 0x3) << 4);
				var crewbits = (((this.crewdist.sys & 0x3) << 4) | ((this.crewdist.eng & 0x3) << 2) | (this.crewdist.wep & 0x3));
				var distbits = (((this.powerdist.sys & 0xF) << 8) | ((this.powerdist.eng & 0xF) << 4) | (this.powerdist.wep & 0xF));
				var hash = (
					hashEncode(HASH_VERSION, 1)
					+ hashEncode(this.shipid & 0x3F, 1)
					+ hashEncode(slot.getDiscounts(), 1)
					+ hashEncode(costbits, 1) + hashEncode(cost, costsize)
					+ hashEncode(crewbits, 1)
					+ hashEncode(distbits, 2)
					+ this.getSlot('ship', 'hatch').getHash()
				);
				for (var g = 0;  g < GROUPS.length;  g++) {
					var slotgroup = GROUPS[g];
					hash += ',';
					var gap = 0;
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
		
		
		getEDSYURL: function() {
			return window.location.protocol + '//' + window.location.hostname + window.location.pathname + '#/L=' + this.getHash();
		}, // getEDSYURL()
		
		
		exportText: function() {
			var ship = eddb.ship[this.shipid];
			if (!ship)
				return '';
			var buffer = [];
			
			// ship hull and cargo hatch
			var line = '[' + ship.name;
			if (this.nametag || this.name) {
				line += ',';
				if (this.nametag)
					line += ' ' + this.nametag;
				if (this.name)
					line += ' "' + this.name.replace(/"/g,'\\"') + '"';
			}
			line += ']';
			var slot = this.getSlot('ship', 'hatch');
			if (slot.getModule())
				line += ' [' + (slot.getPowered() ? '+' : '-') + slot.getPriority() + ']';
			buffer.push(line);
			
			// slots
			for (var groupnum = 0;  groupnum < GROUPS.length;  groupnum++) {
				var newgroup = true;
				for (var slotnum = 0;  slot = this.getSlot(GROUPS[groupnum], slotnum);  slotnum++) {
					if (slot.getModule()) {
						line = slot.exportText();
						if (line) {
							if (newgroup) {
								buffer.push('');
								newgroup = false;
							}
							buffer.push(line);
						}
					}
				}
			}
			
			// stats
			buffer.push('');
			buffer.push('---');
			buffer.push('');
			var mass = this.getStat('mass');
			var fuel = this.getStat('fuelcap');
			var cargo = this.getStat('cargocap');
			var cabin = this.getStat('cabincap');
			buffer.push('Mass  : ' + formatNumText(mass, 2) + ' T empty');
			buffer.push('        ' + formatNumText(mass + fuel + cargo, 2) + ' T full');
			buffer.push('Fuel  : ' + formatNumText(fuel, 0) + ' T');
			buffer.push('Cargo : ' + formatNumText(cargo, 0) + ' T');
			buffer.push('Cabins: ' + formatNumText(cabin, 0));
			var speed = this.getStat('_speed');
			var boost = this.getStat('_boost');
			buffer.push('Speed : ' + formatNumText(speed, 0) + ' m/s (' + formatNumText(boost, 0) + ' boost)');
			var jumpUnladen = this.getStat('_jump_unladen');
			var jumpLaden = this.getStat('_jump_laden');
			buffer.push('Range : ' + formatNumText(jumpUnladen, 2) + ' LY unladen');
			buffer.push('        ' + formatNumText(jumpLaden, 2) + ' LY laden');
			var pwrcap = this.getStat('pwrcap');
			var pwrdraw = this.getStat('pwrdraw_ret')[0];
			buffer.push('Power : ' + formatNumText(pwrdraw, 2) + ' MW retracted (' + formatPctText(pwrdraw / pwrcap, 0) + ')');
			var pwrdraw = this.getStat('pwrdraw_dep')[0];
			buffer.push('        ' + formatNumText(pwrdraw, 2) + ' MW deployed (' + formatPctText(pwrdraw / pwrcap, 0) + ')');
			buffer.push('        ' + formatNumText(pwrcap, 2) + ' MW available');
			var shields = this.getStat('_shields');
			buffer.push('Shield: ' + (shields ? formatNumText(shields, 1) : 'none'));
			var armour = this.getStat('_armour');
			buffer.push('Armour: ' + (armour ? formatNumText(armour, 1) : 'none'));
			var dps = this.getStat('dps');
			buffer.push('Damage: ' + (dps ? (formatNumText(dps, 1) + ' burst DPS') : 'none'));
			var cost = this.getStat('cost');
			buffer.push('Price : ' + formatNumText(cost, 0) + ' CR');
			buffer.push('Re-Buy: ' + formatNumText(cost * 0.05, 0) + ' CR @ 95% insurance');
			buffer.push('');
			
			return buffer.join('\n');
		}, // exportText()
		
		
		exportJournal: function() {
			var ship = eddb.ship[this.shipid];
			if (!ship)
				return '';
			
			// ship hull
			var slot = this.getSlot('ship', 'hull');
			var obj = {
				"event": "Loadout",
				"Ship": (ship.fdname || '').toLowerCase(),
				"ShipName": (this.name || ''),
				"ShipIdent": (this.nametag || ''),
				"HullValue": parseInt(slot.getCost()),
				"ModulesValue": 0,
				"UnladenMass": parseFloat(this.getStat('mass').toFixed(6)),
				"CargoCapacity": parseInt(this.getStat('cargocap')),
				"MaxJumpRange": parseFloat(this.getStat('_jump_max').toFixed(6)),
				"FuelCapacity": {
					"Main": parseFloat(this.getStat('fuelcap').toFixed(6)),
					"Reserve": parseFloat(ship.fuelreserve.toFixed(6)),
				},
				"Rebuy": parseInt(this.getStat('cost') * (1 - (current.option.insurance / 10000.0))),
				"Modules": [],
			};
			
			// cargo hatch
			var slot = this.getSlot('ship', 'hatch');
			if (slot.getModule()) {
				obj.Modules.push({
					"Slot": "CargoHatch",
					"Item": ("ModularCargoBayDoor" + ((ship.fdid == 128049351) ? 'FDL' : '')).toLowerCase(),
					"On": !!slot.getPowered(),
					"Priority": parseInt(slot.getPriority() - 1),
				});
			}
			
			// slots
			var milslots = [];
			for (var groupnum = 0;  groupnum < GROUPS.length;  groupnum++) {
				for (var slotnum = 0;  slot = this.getSlot(GROUPS[groupnum], slotnum);  slotnum++) {
					var slotobj = slot.exportJournal();
					if (slotobj) {
						((GROUPS[groupnum] === 'military') ? milslots : obj.Modules).push(slotobj);
						obj.ModulesValue += parseInt(slot.getCost()) || 0;
					}
				}
			}
			if (milslots.length > 0)
				obj.Modules = obj.Modules.concat(milslots);
			
			return obj;
		}, // exportJournal()
		
		
		exportSLEF: function() {
			return JSON.stringify(
				[
					{
						"header": {
							"appName": "EDSY",
							"appVersion": VERSIONS[3],
							"appURL": this.getEDSYURL()
						},
						"data": this.exportJournal()
					}
				]
			);
		}, // exportSLEF()
		
		
		exportEDOMH: function() {
			var ship = eddb.ship[this.shipid];
			if (!ship)
				return '';
			
			var obj = {
				"version": 1,
				"ship": (ship.fdname || '').toLowerCase(),
				"name": (this.name || ''),
				"items": [],
			};
			
			var slot = null;
			var slotobj = null;
			for (var groupnum = 0;  groupnum < GROUPS.length;  groupnum++) {
				for (var slotnum = 0;  slot = this.getSlot(GROUPS[groupnum], slotnum);  slotnum++) {
					// repeating the structure separately for blueprint and experimental seems weird to me, but it's how they want it *shrug*
					slotobj = slot.exportEDOMH();
					if (slotobj) {
						if (slotobj["experimental"]) {
							delete slotobj["experimental"];
							obj["items"].push(slotobj);
							slotobj = slot.exportEDOMH();
							slotobj["blueprint"] = slotobj["experimental"];
							delete slotobj["grade"];
							delete slotobj["highestGradePercentage"];
							delete slotobj["experimental"];
						}
						obj["items"].push(slotobj);
					}
				}
			}
			
			if (obj["items"].length < 1)
				return null;
			return obj;
		}, // exportEDOMH()
		
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
		var slot = build.getSlot('ship', 'hull');
		var discounts = ((version >= 14) ? hashDecode(hashgroup.ship.slice(i, i += 1)) : 0);
		var cost = 0;
		if (version >= 15) {
			var costbits = hashDecode(hashgroup.ship.slice(i, i += 1));
			cost = hashDecode(hashgroup.ship.slice(i, (i += (((costbits >> 4) & 0x3) + 2))));
			cost = (cost << 4) + (costbits & 0xF);
		}
		var crewbits = ((version >= 12) ? hashDecode(hashgroup.ship.slice(i, i += 1)) : 0);
		var distbits = ((version >= 12) ? hashDecode(hashgroup.ship.slice(i, i += 2)) : 0x444);
		if (cost) {
			if (!slot.setCost(cost)) {
				if (errors) errors.push('Invalid hull cost: ' + cost);
			}
		} else {
			if (!slot.setDiscounts(discounts)) {
				if (errors) errors.push('Invalid hull discounts: ' + discounts);
			}
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
			slot.setHash(hashgroup.ship.slice(i), version, errors, current.option.experimental || EXPERIMENTAL_IMPORT);
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
					var costed = ((version >= 15) ? (slotbits & 0x20) : 0);
					var discounted = ((version >= 15) ? !costed : ((version >= 14) ? (slotbits & 0x20) : 0));
					var engineered = (slotbits & 0x10);
					if (costed) {
						var costbits = hashDecode(hashgroup[slotgroup].slice(j, (j += 1)));
						j += (((costbits >> 4) & 0x3) + 2);
					} else if (discounted) {
						j += 1;
					}
					if (engineered) {
						var engbits = ((version >= 9) ? hashDecode(hashgroup[slotgroup].slice(j, j += ((version >= 12 && version <= 14) ? 3 : 2))) : 0);
						var nummods = 0;
						if (version >= 15) {
							j += 2; // bproll
							nummods = hashDecode(hashgroup[slotgroup].slice(j, j += 1));
						} else if (!(version >= 14 && (engbits & 0x20000))) { // !bprolled
							nummods = ((version >= 12) ? (engbits & 0x1F) : (engbits & 0x3F));
						}
						j += nummods * 4;
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
						slot.setHash(hashgroup[slotgroup].slice(i, j), version, errors, current.option.experimental || EXPERIMENTAL_IMPORT);
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
					cls   : [null,'misc_lw','misc_rf','misc_sh'],
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
					16819:12180, 16818:12280, 16817:12380, 16816:12480, 16815:12580, // Guardian Frame Shift Drive Booster
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
			case 14:
			case 15:
			case 16:
				idmap.module[86220] = 86250; // AX Missile Rack
				idmap.module[86222] = 86262; // AX Missile Rack
				idmap.module[86310] = 86330; // AX Missile Rack
				idmap.module[86312] = 86352; // AX Missile Rack
			case 17: // HASH_VERSION
			default:
			}
		}
		return idmap;
	}; // Build.getHashVersionMap()
	
	
	Build.fromJournal = function(json, errors, slefheader) {
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
		if (slefheader && (slefheader['appName'] || '').trim().toUpperCase() === 'INARA') {
			var inaraAcct = (slefheader['appCustomProperties'] || EMPTY_OBJ)['inaraCommanderID'];
			var inaraShip = (slefheader['appCustomProperties'] || EMPTY_OBJ)['inaraShipID'];
			if (!build.setInaraXref(inaraAcct, inaraShip)) {
				if (errors) errors.push('Invalid Inara xref: ' + inaraAcct + '/' + inaraShip);
			}
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
				// since the slot size could be misreported by the slot name, take the greater of that or the size of the actual slotted module, if any
				if (modulejson) {
					var fdname = (modulejson.Item || '').trim().toUpperCase();
					var modid = fdevmap.shipModule[shipid][fdname] || fdevmap.module[fdname];
					var module = eddb.module[modid];
					if (module)
						slotSize[slotname] = max(slotSize[slotname], (module.class || 0) | 0);
				}
			} else if (slotname === 'PLANETARYAPPROACHSUITE') {
				/* ignore the approach suite; someday maybe we'll handle it, til then we'll just pretend it doesn't exist
				var fdname = (modulejson.Item || '').trim().toUpperCase();
				if (fdname === 'INT_PLANETAPPROACHSUITE') {
					extravalue += (modulejson.Value || 0);
				}
				*/
			} else if (slotname === 'CARGOHATCH') {
				// special handling for the cargo hatch, just for powered and priority settings
				var slot = build.getSlot('ship', 'hatch');
				var fdname = (modulejson.Item || '').trim().toUpperCase();
				if (fdname === 'MODULARCARGOBAYDOOR' || fdname === 'MODULARCARGOBAYDOORFDL') {
					if (!slot.setPowered(modulejson.On)) {
						if (errors) errors.push(modulejson.Slot + ': Invalid powered setting: ' + modulejson.On);
					}
					if (!slot.setPriority(parseInt(modulejson.Priority) + 1)) {
						if (errors) errors.push(modulejson.Slot + ': Invalid priority setting: ' + modulejson.Priority);
					}
				} else if (errors) errors.push(modulejson.Slot + ': Invalid module: ' + modulejson.Item);
			}
		}
		
		// get the hull and module costs
		if ('HullValue' in json) {
			// this does not seem to be modified by HullHealth
			var slot = build.getSlot('ship', 'hull');
			if (!slot.setCost((json.HullValue || 0) + extravalue)) {
				if (errors) errors.push('Invalid hull value: ' + json.HullValue + '+' + extravalue);
			}
		}
		var modulesValueExpected = json['ModulesValue'];
		var modulesValueActual = 0;
		
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
						if (modid > 0) {
							if (slot.setModuleID(modid, true)) {
								if (!current.option.experimental && !slot.setModuleID(modid)) {
									if (errors) errors.push(modulejson.Slot + ': ' + getModuleLabel(slot.getModule()) + ' requires Experimental Mode');
								}
								// module Value is penalized by Health!
								if (('Value' in modulejson) && modulejson['Health']) {
									modulesValueExpected -= modulejson.Value / modulejson.Health;
									if (!slot.setCost(modulejson.Value)) {
										if (errors) errors.push(modulejson.Slot + ': Invalid value: ' + modulejson.Value);
									}
								} else {
									modulesValueActual += slot.getCost();
								}
								var mtypeid = slot.getModule().mtype;
								if (modulejson.Engineering) {
									var fdname = (modulejson.Engineering.BlueprintName || '').trim().toUpperCase();
									var bpid = fdevmap.mtypeBlueprint[mtypeid][fdname];
									var bpgrade = 0;
									var bproll = 0;
									if (bpid) {
										bpgrade = parseInt(modulejson.Engineering.Level);
										// pre-3.0 utility ammo blueprints only had a grade 3, which now has to be grade 1
										if (fdname === 'CHAFFLAUNCHER_CHAFFCAPACITY' || fdname === 'HEATSINKLAUNCHER_HEATSINKCAPACITY' || fdname === 'POINTDEFENCE_POINTDEFENSECAPACITY')
											bpgrade = 1;
										bproll = parseFloat(modulejson.Engineering.Quality);
										if (isNaN(bproll) || bproll <= 0)
											bproll = 0;
										if (!slot.setBlueprint(bpid, bpgrade, bproll)) {
											if (errors) errors.push(modulejson.Slot + ': Invalid blueprint: ' + modulejson.Engineering.BlueprintName);
										}
									} else if (modulejson.Engineering.BlueprintName && errors) errors.push(modulejson.Slot + ': Unknown blueprint: ' + modulejson.Engineering.BlueprintName);
									
									var expid = fdevmap.expeffect[(modulejson.Engineering.ExperimentalEffect || '').trim().toUpperCase()];
									if (expid) {
										if (!slot.setExpeffectID(expid)) {
											if (errors) errors.push(modulejson.Slot + ': Invalid experimental: ' + modulejson.Engineering.ExperimentalEffect);
										}
									} else if (modulejson.Engineering.ExperimentalEffect && errors) errors.push(modulejson.Slot + ': Unknown experimental: ' + modulejson.Engineering.ExperimentalEffect);
									
									// if there are any individual attribute modifiers, apply them over the blueprint baseline
									if ((modulejson.Engineering.Modifiers || EMPTY_ARR).length > 0) {
										var bpmods = slot.getAllBaseAttrModifiers();
if (false && current.dev) console.log(json.Ship+' '+modulejson.Item+' '+bpid+' g'+bpgrade+' @'+bproll+': '+ JSON.stringify(bpmods)); // TODO DEBUG
										
										// if there's a DPS modifier, it's redundant with Damage and/or ROF modifiers *except for beam weapons* -- in that case, it's the only one present
										// if there's a ROF modifier, handle it last so it takes into account bstsize/bstrof
										var modlist = [];
										var modjson_dmg = null;
										var modjson_dps = null;
										var modjson_rof = null;
										for (var m = 0;  m < modulejson.Engineering.Modifiers.length;  m++) {
											var modjson = modulejson.Engineering.Modifiers[m];
											var attr = fdevmap.fieldAttr[modjson.Label];
											if (modjson.Label === 'RateOfFire') {
												modjson_rof = modjson;
											} else if (modjson.Label === 'DamagePerSecond') {
												modjson_dps = modjson;
											} else if (attr) {
												if (attr === 'damage')
													modjson_dmg = modjson;
												modlist.push(modjson);
											}
										}
										if (modjson_dps && !modjson_rof && !modjson_dmg) {
											modjson_dps.Label = 'Damage';
											modlist.push(modjson_dps);
										}
										if (modjson_rof) {
											modlist.push(modjson_rof);
										}
										
										// apply modifiers
										for (var m = 0;  m < modlist.length;  m++) {
											var modjson = modlist[m];
											var attr = fdevmap.fieldAttr[modjson.Label];
											if (attr) {
												var module = slot.getModule();
												var base = parseFloat(modjson.OriginalValue);
												if (isNaN(base))
													base = slot.getBaseAttrValue(attr);
else if(current.dev && abs(base - slot.getBaseAttrValue(attr)) > 0.00001) console.log(modulejson.Item+' '+attr+' base '+modjson.OriginalValue+' vs expected '+slot.getBaseAttrValue(attr));
												var modifier = getAttrModifier(attr, base, parseFloat(modjson.Value));
												if (!isModuleAttrModifiable(module, attr)) {
													// ignore unmodifiable attributes, Journal includes them all the time (mass on lightweight bulkheads, shotspd, etc)
if (false && current.dev) console.log(modulejson.Item+' '+attr+':'+modifier+' unmodifiable');
												} else if (abs(slot.getEffectiveAttrModifier(attr) - modifier) < 0.000005) {
if (false && current.dev) console.log(json.Ship+' '+modulejson.Item+' '+attr+' rolled '+slot.getEffectiveAttrModifier(attr)+', skipping specified '+modifier);
													if (bpmods) delete bpmods[attr];
													if (bpmods && attr === 'rof') delete bpmods['bstint'];
												} else if (!slot.setEffectiveAttrModifier(attr, modifier)) {
													if (errors) errors.push(modulejson.Slot + ': Invalid modifier: ' + modjson.Label + '=' + modjson.Value);
												} else {
if (false && current.dev) { // TODO DEBUG
var attrroll = getBlueprintGradeAttrModifierRoll(bpid, bpgrade, attr, slot.getBaseAttrModifier(attr));
if (attrroll && abs(attrroll - bproll) > 0.0001) console.log(json.Ship+' '+modulejson.Item+' '+attr+' roll '+attrroll+' vs '+bproll+', error '+(attrroll - bproll)+' curve '+(log(attrroll) / log(bproll)));
}
													if (bpmods) delete bpmods[attr];
													if (bpmods && attr === 'rof') delete bpmods['bstint'];
												}
											} else if (attr !== null && errors) errors.push(modulejson.Slot + ': Modifier #' + (m+1) + ': Unknown attribute: ' + modjson.Label);
										}
										
										// check for blueprint modifiers that weren't specified individually; if any, this is probably a special pre-engineered module
										for (var attr in (bpmods || EMPTY_OBJ)) {
											if (bpmods[attr]) {
if (true && current.dev) console.log(json.Ship+' '+modulejson.Item+' leftover '+attr+':'+bpmods[attr]+' modifier'); // TODO DEBUG
												slot.setAttrModifier(attr, 0);
												slot.setBlueprintRoll(0);
											}
										}
									}
								}
							} else if (errors) errors.push(modulejson.Slot + ': Invalid module: ' + modulejson.Item);
						} else if (!modid && modulejson.Item && errors) errors.push(modulejson.Slot + ': Unknown module: ' + modulejson.Item);
						
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
		
		// check modules value
		if (!isNaN(modulesValueExpected) && !isNaN(modulesValueActual) && modulesValueExpected != modulesValueActual && modulesValueActual > 0) {
			var discounts = getClosestDiscount(modulesValueExpected / modulesValueActual);
			if (discounts > 0) {
				for (var slotgroup in eddb.group) {
					for (var slotnum = 0;  slot = build.getSlot(slotgroup, slotnum);  slotnum++) {
						if (!slot.hasActualCost()) {
							slot.setDiscounts(discounts);
						}
					}
				}
				if (errors) errors.push('Module values not specified; applying estimated '+formatPctText(1 - cache.discountMod[discounts], 1)+' discount');
			}
		}
		
		return build;
	}; // Build.fromJournal()
	
	
	Build.fromCAPI = function(shipobj, errors, unknowns) {
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
					
					var modifiers = {};
					var mod_weapon_falloffrange_from_range = false;
					
					if (modifierobj) { // after 2.4
						for (var field in modifierobj) {
							// 'field' has OutfittingFieldType_ / Override_ prefix
							var attr = fdevmap.fieldAttr[field.slice(field.indexOf('_') + 1)];
							var modifier = parseFloat(modifierobj[field]["value"]);
							if (attr === 'rof') {
								attr = 'bstint';
								modifier = (1 / (modifier - 1)) + 1;
							}
							var attribute = cache.attribute[attr];
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
								errors.push(slotname + ': ' + modulename + ': Unknown obj field: ' + field);
							}
						}
					}
					
					if (modifierarr) { // before 2.3
						for (var m = 0;  m < modifierarr.length;  m++) {
							var field = modifierarr[m].name;
							var fieldmodifier = parseFloat(modifierarr[m].value);
							var attrmods = eddb.fdattrmod[field];
							var expid = fdevmap.expeffect[field.toUpperCase()];
							if (field === 'mod_weapon_clip_size_override') {
								modifiers['ammoclip'] = getModuleAttrModifier(module, 'ammoclip', fieldmodifier);
							} else if (field === 'mod_weapon_falloffrange_from_range') {
								mod_weapon_falloffrange_from_range = true;
							} else if (attrmods) {
								for (var attr in attrmods) {
									var attribute = cache.attribute[attr];
									var modifier = fieldmodifier * attrmods[attr];
									modifiers[attr] = (attribute.modset ? modifier : getAttrModifierSum(attr, modifiers[attr], modifier));
								}
							} else if (expid) {
								specialobj = specialobj || {};
								specialobj[field] = fieldmodifier;
							} else if (unknowns) {
								var tag = slotname + ': ' + modulename;
								if (!unknowns[tag])
									unknowns[tag] = {};
								unknowns[tag][field] = 1;
							} else if (errors) {
								errors.push(slotname + ': ' + modulename + ': Unknown arr field: ' + field);
							}
						}
					}
					
					if (specialobj) {
						for (var field in specialobj) {
							if (module.mtype === 'hrg' && (field === 'special_feedback_cascade' || field === 'special_plasma_slug' || field === 'special_super_penetrator'))
								field += '_cooled';
							eventengobj["ExperimentalEffect"] = field;
							var expid = fdevmap.expeffect[field.toUpperCase()];
							var expeffect = eddb.expeffect[expid];
							if (expeffect) {
								for (var attr in expeffect) {
									var attribute = cache.attribute[attr];
									var modifier = expeffect[attr];
									if (!isModuleAttrModifiable(module, attr)) {
										// ignore
									} else if (modifier) {
										modifier /= ((attribute.modset || attribute.modadd) ? 1 : (attribute.modmod || 100));
										modifiers[attr] = (attribute.modset ? modifier : getAttrModifierSum(attr, modifiers[attr], modifier));
									}
								}
							} else if (unknowns) {
								var tag = slotname + ': ' + modulename;
								if (!unknowns[tag])
									unknowns[tag] = {};
								unknowns[tag][field] = 1;
							} else if (errors) {
								errors.push(slotname + ': ' + modulename + ': Unknown special: ' + field);
							}
						}
					}
					
					if (mod_weapon_falloffrange_from_range && modifiers['maximumrng']) {
						modifiers['dmgfall'] = getModuleAttrModifier(module, 'dmgfall', getModuleAttrValue(module, 'maximumrng', modifiers['maximumrng']));
					}
					if (modifiers['bstint']) {
						// translate bstint back to rof, considering modified bstsize/bstrof
						var duration = 0; // TODO: verify that CAPI bstint modifier assumes 0 charge time for variable charge (dmgmul) weapons
						var bstsize = getModuleAttrValue(module, 'bstsize', modifiers['bstsize']);
						var bstrof = getModuleAttrValue(module, 'bstrof', modifiers['bstrof']);
						var bstint = getModuleAttrValue(module, 'bstint', modifiers['bstint']);
						var rof = (bstsize / ((bstsize / bstrof) + max(0, bstint - 1 / bstrof) + duration)) * (1 + (modifiers['rof'] || 0));
						modifiers['rof'] = getModuleAttrModifier(module, 'rof', rof);
						delete modifiers['bstint'];
					}
					
					for (var attr in modifiers) {
						var modifier = modifiers[attr];
						var field = fdevmap.attrField[attr];
						if (modifier && field) {
							eventengobj["Modifiers"].push({
								"Label": field,
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
		return Build.fromJournal(eventobj, errors);
	}; // Build.fromCAPI()
	
	
	/*
	* MODULES & ATTRIBUTES
	*/
	
	
	var getAttrValue = function(attr, value, modifier) {
		var attribute = cache.attribute[attr];
		if (attribute) {
			// fall back on attribute default value
			if (value === undefined && !isNaN(attribute.default))
				value = attribute.default;
			
			// apply modifier?
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
				
				// apply constraints
				if (attribute.step)
					value = round(value / attribute.step) * attribute.step;
				if (attribute.min !== undefined)
					value = max(value, attribute.min);
				if (attribute.max !== undefined)
					value = min(value, attribute.max);
			}
		}
		return value;
	}; // getAttrValue()
	
	
	var getAttrModifier = function(attr, base, value) {
		var attribute = cache.attribute[attr];
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
		var attribute = cache.attribute[attr];
		return (modifier * (attribute.modmod || 1) * (attribute.bad ? -1 : 1));
	}; // getAttrModifierDirection()
	
	
	var getAttrModifierSum = function(attr, modifier1, modifier2) {
		if (!modifier1 || !modifier2)
			return (modifier2 || modifier1);
		var attribute = cache.attribute[attr];
		if (attribute.modset)
			return modifier2;
		if (attribute.modadd)
			return modifier1 + modifier2;
		// modmod and standard
		return ((1 + modifier1) * (1 + modifier2) - 1);
	}; // getAttrModifierSum()
	
	
	var getAttrModifierDifference = function(attr, modifier1, modifier2) {
		var attribute = cache.attribute[attr];
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
			if (cache.attribute[attr] && !cache.attribute[attr].hidden)
				attrflag[attr] = 1;
		}
		var mtype = eddb.mtype[module.mtype];
		if (mtype) {
			var modifiable = (mtype.modifiable || EMPTY_ARR);
			for (var a = 0;  a < modifiable.length;  a++) {
				if (cache.attribute[modifiable[a]])
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
		var attribute = cache.attribute[attr];
		if (!module || !attribute)
			return -1;
		var modifiable = (eddb.mtype[module.mtype] || EMPTY_OBJ).modifiable;
		var value = ((attr in module) ? module[attr] : attribute.default);
		if (!modifiable || isNaN(value) || (value == 0 && !attribute.modset && !attribute.modadd && !attribute.modmod))
			return -1;
		return modifiable.indexOf(attr);
	}; // getModuleAttrModificationIndex()
	
	
	var isModuleAttrModifiable = function(module, attr) {
		return ((getModuleAttrModificationIndex(module, attr) >= 0) || ((attr === 'rof') && (getModuleAttrModificationIndex(module, 'bstint') >= 0)));
	}; // isModuleAttrModifiable()
	
	
	var getModuleAttrValue = function(module, attr, modifier) {
		if (!module)
			return undefined;
		var value = module[attr];
		switch (attr) {
		case 'fpc':
		case 'sfpc':
			value = getModuleAttrValue(module, 'ammoclip') || getModuleAttrValue(module, 'bstsize');
			break;
			
		case 'spc':
		case 'sspc':
			var dmgmul = getModuleAttrValue(module, 'dmgmul');
			var duration = getModuleAttrValue(module, 'duration') * (dmgmul ? WEAPON_CHARGE : 1.0);
			if (module.name === eddb.module[84224].name && attr === 'sspc') // TODO: bug? Imperial Hammer Rail Gun can keep firing through reloads without re-charging
				duration = 0;
			var bstsize = getModuleAttrValue(module, 'bstsize');
			var bstrof = getModuleAttrValue(module, 'bstrof');
			var bstint = getModuleAttrValue(module, 'bstint');
			value = (duration + (bstsize - 1) / bstrof + bstint);
			var ammoclip = getModuleAttrValue(module, 'ammoclip');
			var rldtime = (attr === 'sspc') ? getModuleAttrValue(module, 'rldtime') : 0;
			if (ammoclip) {
				value *= ceil(ammoclip / bstsize);
			}
			value += max(0, rldtime - duration - bstint);
			break;
			
		case 'rof':
		case 'srof':
			value = (getModuleAttrValue(module, (attr === 'srof') ? 'sfpc' : 'fpc') / getModuleAttrValue(module, (attr === 'srof') ? 'sspc' : 'spc'));
			break;
			
		case 'dps':
		case 'sdps':
			var damage = getModuleAttrValue(module, 'damage');
			var dmgmul = (1 + WEAPON_CHARGE * ((getModuleAttrValue(module, 'dmgmul') || 1) - 1));
			var rounds = getModuleAttrValue(module, 'rounds');
			var rof = getModuleAttrValue(module, (attr === 'sdps') ? 'srof' : 'rof');
			value = (damage * dmgmul * rounds * (isFinite(rof) ? rof : 1));
			break;
			
		case 'eps':
		case 'seps':
			var distdraw = getModuleAttrValue(module, 'distdraw');
			var rof = getModuleAttrValue(module, (attr === 'seps') ? 'srof' : 'rof');
			value = (distdraw * (isFinite(rof) ? rof : 1));
			break;
			
		case 'hps':
		case 'shps':
			var thmload = getModuleAttrValue(module, 'thmload');
			var rof = getModuleAttrValue(module, (attr === 'shps') ? 'srof' : 'rof');
			value = (thmload * (isFinite(rof) ? rof : 1));
			break;
			
		case 'engminmul':
		case 'engoptmul':
		case 'engmaxmul':
			var attr3 = attr.slice(3);
			var attrspd = attr3+'spd', attracc = attr3+'acc', attrrot = attr3+'rot';
			if (attrspd in module || attracc in module || attrrot in module) {
				value = (getModuleAttrValue(module, attrspd) + getModuleAttrValue(module, attracc) + getModuleAttrValue(module, attrrot)) / 3.0;
			}
			break;
		}
		var attribute = cache.attribute[attr];
		if (value === undefined && attribute && isNaN(attribute.default) && !isNaN(attribute.scale))
			value = getModuleAttrValue(module, attribute.default);
		return getAttrValue(attr, value, modifier);
	}; // getModuleAttrValue()
	
	
	var getModuleAttrValueText = function(module, attr, value) {
		var attribute = cache.attribute[attr];
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
			if (!cache.reTrailingPointZero) {
				var sep = formatNumText(1.234,3).substring(1,2);
				cache.reTrailingPointZero = new RegExp('(\\'+sep+'[0-9]*?[1-9])0+$|\\'+sep+'0*$');
			}
			var text = formatNumText(value, decimals).replace(cache.reTrailingPointZero, '$1');
		} else {
			var step = pow(10, -decimals);
			var text = formatNumText(((value / step + 0.5) | 0) * step, 0);
		}
		return text;
	}; // getModuleAttrValueText()
	
	
	var getModuleAttrModifier = function(module, attr, value) {
		var attribute = cache.attribute[attr];
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
			var attribute = cache.attribute[attr];
			if (attribute.modset || attribute.modadd) {
				text += formatNumText(value - base, (attribute.step >= 1) ? 0 : 2);
			} else if (attribute.modmod || attribute.unit === '%') {
				text += formatNumText(value - base, 1) + '%';
			} else {
				text += formatNumText(((value / base) - 1) * 100, 1) + '%';
			}
		}
		return text;
	}; // getModuleAttrModifierText()
	
	
	var getModuleAttrModifierHTML = function(module, attr, modifier) {
		return getModuleAttrModifierText(module, attr, modifier).replace('%', '<small class="semantic">%</small>');
	}; // getModuleAttrModifierHTML()
	
	
	var parseModuleAttrModifierText = function(module, attr, text) {
		var attribute = cache.attribute[attr];
		text = text.trim();
		var textvalue = parseNumText(text);
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
	
	
	var getBlueprintGradeRollAttrModifier = function(bpid, bpgrade, bproll, attr) {
		var blueprint = eddb.blueprint[bpid];
		if (!blueprint)
			return null;
		var attribute = cache.attribute[attr];
		if (!attribute || !blueprint[attr])
			return null;
		bpgrade = min(max(bpgrade, 1), blueprint.maxgrade);
		bproll = min(max(bproll, 0), 1);
		var himod = blueprint[attr][bpgrade - 1];
		var lomod = ((bpgrade > 1) ? blueprint[attr][bpgrade - 2] : ((himod && blueprint[attr][1]) ? (himod - (blueprint[attr][1] - himod)) : 0));
		return (((himod < 0) === !attribute.bad) ? himod : (lomod + bproll * (himod - lomod))) / (attribute.modmod || ((attribute.modadd || attribute.modset) ? 1 : 100));
	}; // getBlueprintGradeRollAttrModifier()
	
	
	var getBlueprintGradeAttrModifierRoll = function(bpid, bpgrade, attr, modifier) {
		var blueprint = eddb.blueprint[bpid];
		if (!blueprint)
			return null;
		var attribute = cache.attribute[attr];
		if (!attribute || !blueprint[attr])
			return null;
		bpgrade = min(max(bpgrade, 1), blueprint.maxgrade);
		var himod = blueprint[attr][bpgrade - 1];
		if ((himod < 0) === !attribute.bad)
			return null;
		var lomod = ((bpgrade > 1) ? blueprint[attr][bpgrade - 2] : ((himod && blueprint[attr][1]) ? (himod - (blueprint[attr][1] - himod)) : 0));
		return ((modifier * (attribute.modmod || ((attribute.modadd || attribute.modset) ? 1 : 100))) - lomod) / (himod - lomod);
	}; // getBlueprintGradeAttrModifierRoll()
	
	
	/*
	* DATABASE CACHE INIT
	*/
	
	
	var sortObjKeyAsc = function(o1,o2) {
		return ((o1.key < o2.key) ? -1 : ((o1.key > o2.key) ? 1 : ((o1.key2 < o2.key2) ? -1 : ((o1.key2 > o2.key2) ? 1 : 0))));
	}; // sortObjKeyAsc()
	
	
	var sortObjKeyDesc = function(o1,o2) {
		return ((o1.key < o2.key) ? 1 : ((o1.key > o2.key) ? -1 : ((o1.key2 < o2.key2) ? 1 : ((o1.key2 > o2.key2) ? -1 : 0))));
	}; // sortObjKeyDesc()
	
	
	var sortNumbers = function(num1, num2) {
		return num1 - num2;
	}; // sortNumbers()
	
	
	var sortNumbersDesc = function(num1, num2) {
		return num2 - num1;
	}; // sortNumbersDesc()
	
	
	var sortStoreds = function(stored1, stored2) {
		return ((stored1.name < stored2.name) ? -1 : ((stored1.name > stored2.name) ? 1 : 0));
	}; // sortStoreds()
	
	
	var sortAttributes = function(attr1, attr2) {
		var a1 = cache.attribute[attr1];
		var a2 = cache.attribute[attr2];
		var v1 = a1._index;
		var v2 = a2._index;
		if (v1 != v2) return v1 - v2;
		v1 = a1.name;
		v2 = a2.name;
		if (v1 != v2) return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
		v1 = attr1;
		v2 = attr2;
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortAttributes()
	
	
	var sortMaterials = function(mat1, mat2) {
		var m1 = eddb.material[mat1];
		var m2 = eddb.material[mat2];
		if (!m1 || !m2) return (m1 ? 1 : (m2 ? -1 : 0));
		var v1 = m1.name;
		var v2 = m2.name;
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortMaterials();
	
	
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
		var a1 = eddb.mtype[m1.mtype].modulenames[m1.name];
		v1 = (a1 ? ((typeof a1 !== 'string') ? 0 : 1) : 2);
		var a2 = eddb.mtype[m2.mtype].modulenames[m2.name];
		v2 = (a2 ? ((typeof a2 !== 'string') ? 0 : 1) : 2);
		if (v1 != v2) return v1 - v2;
		// by abbreviation
		if (v1 === 1 && a1 !== a2)
			return (a1 < a2) ? -1 : 1;
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
			// by multi limpet type (M-O-R-X-U)
			v1 = 0 + (((m1.mlctype == 'U') ? 'z' : m1.mlctype) || ' ').charCodeAt(0);
			v2 = 0 + (((m2.mlctype == 'U') ? 'z' : m2.mlctype) || ' ').charCodeAt(0);
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
				lo = md;
			} else if (val > mod) {
				hi = md;
			} else {
				return a[md];
			}
		}
		return (((mod - cache.discountMod[a[lo]]) < (cache.discountMod[a[hi]] - mod)) ? a[lo] : a[hi]);
	}; // getClosestDiscount()
	
	
	var sortSlotModules = function(slot1, slot2) {
		// by emptiness
		var m1 = slot1.getModule();
		var m2 = slot2.getModule();
		var v1 = !!m1;
		var v2 = !!m2;
		if (!v1 || !v2) return (v1 ? -1 : (v2 ? 1 : 0));
		var c;
		// if same/different module ...
		if (slot1.getModuleID() == slot2.getModuleID()) {
			// by blueprint
			c = sortBlueprints(slot1.getBlueprintID(), slot2.getBlueprintID());
			if (c) return c;
			// by grade
			v1 = slot1.getBlueprintGrade();
			v2 = slot2.getBlueprintGrade();
			if (v1 != v2) return v2 - v1;
			// by roll
			v1 = slot1.getBlueprintRoll();
			v2 = slot2.getBlueprintRoll();
			if (v1 != v2) return v2 - v1;
			// by expeffect
			c = sortExpeffects(slot1.getExpeffectID(), slot2.getExpeffectID());
			if (c) return c;
			// by discount
			c = sortDiscounts(slot1.getDiscounts(), slot2.getDiscounts());
			if (c) return c;
		} else {
			// by slotgroup
			v1 = GROUPS.indexOf(slot1.getSlotGroup());
			v2 = GROUPS.indexOf(slot2.getSlotGroup());
			if (v1 != v2) return v2 - v1;
			// if not core component, ...
			if (GROUPS[v1] !== 'component') {
				// by class (size), descending
				v1 = 0 + (m1.class || 0);
				v2 = 0 + (m2.class || 0);
				if (v1 != v2) return v2 - v1;
				// by mtype
				c = sortMtypes(m1.mtype, m2.mtype);
				if (c) return c;
				// by name
				v1 = m1.name;
				v2 = m2.name;
				if (v1 != v2) return ((v1 < v2) ? -1 : (v1 > v2) ? 1 : 0);
				// by cost
				v1 = 0 - (m1.cost || 0);
				v2 = 0 - (m2.cost || 0);
				if (v1 != v2) return v1 - v2;
			}
		}
		// by slot index
		v1 = slot1.getSlotNum();
		v2 = slot2.getSlotNum();
		if (v1 != v2) return v1 - v2;
		
		return 0;
	}; // sortSlotModules()
	
	
	var initCache = function() {
		// initialize default builtin options
		for (var bmodid in BUILTIN_STORED_MODULES) {
			var opt = 'builtin' + bmodid;
			current.option[opt] = (BUILTIN_STORED_MODULES[bmodid].available ? true : false);
		}
		
		// store default CSS options
		var compStyle = getComputedStyle(document.documentElement);
		for (var i = 0;  i < CSS_FONTS.length;  i++) {
			var opt = 'font' + CSS_FONTS[i];
			cache.option[opt] = compStyle.getPropertyValue('--' + opt).trim();
			current.option[opt] = '';
		}
		current.option.colorinvert = cache.option.colorinvert = false;
		for (var n = 1;  n <= 5;  n++) {
			var opt = 'colorgrey' + n;
			cache.option[opt] = compStyle.getPropertyValue('--' + opt).trim();
		}
		for (var i = 0;  i < CSS_COLORS.length;  i++) {
			for (var n = 1;  n <= 5;  n++) {
				var opt = 'color' + CSS_COLORS[i] + n;
				cache.option[opt] = compStyle.getPropertyValue('--' + opt).trim();
				current.option[opt] = '';
			}
		}
		
		// identify and sort ships
		cache.ships = Object.keys(eddb.ship);
		cache.ships.sort(sortShipIDs);
		
		// initialize attribute cache
		for (var i = 0;  i < eddb.attributes.length;  i++) {
			var attribute = eddb.attributes[i];
			attribute._index = i;
			if (attribute.attr)
				cache.attribute[attribute.attr] = attribute;
		}
		
		// initialize ship-specific modules and stock ship builds and hashes
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
		cache.mtypeBuiltins = {};
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
						cache.mtypeBuiltins[mtype] = [];
					}
				}
			} else if (group === 'military') {
				// display all military under internals
			} else {
				for (var mtype in eddb.group[group].mtypes) {
					cache.groupMtypes[group].push(mtype);
					cache.mtypeModules[mtype] = [];
					cache.mtypeBuiltins[mtype] = [];
				}
				cache.groupMtypes[group].sort(sortMtypes);
			}
		}
		
		// initialize stock module hashes and sort mtype modules
		cache.moduleHash = {};
		for (var modid in eddb.module) {
			cache.moduleHash[modid] = Slot.getModuleIDStoredHash(modid);
			var mtype = eddb.module[modid].mtype;
			if (cache.mtypeModules[mtype] && !eddb.module[modid].hidden) {
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
		
		// sort mtype builtins
		for (var bmodid in BUILTIN_STORED_MODULES) {
			var modid = Slot.getStoredHashModuleID(BUILTIN_STORED_MODULES[bmodid].modulehash);
			var mtype = eddb.module[modid].mtype;
			if (cache.mtypeBuiltins[mtype]) {
				cache.mtypeBuiltins[mtype].push(bmodid);
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
		var db = ((1 << DISCOUNTS.length) - 1);
		cache.discountMod[db] = 0;
		while (db-- > 0) {
			var mod = 1.0, m = 1, i = DISCOUNTS.length;
			while (i-- > 0) {
				mod *= (db & m) ? (1.0 - DISCOUNTS[i] / 100.0) : 1.0;
				m <<= 1;
			}
			cache.discountMod[db] = mod;
		}
		cache.discounts = Object.keys(cache.discountMod);
		cache.discounts.sort(sortDiscounts);
	}; // initCache()
	
	
	/*
	* PAGE & POPUP UI
	*/
	
	
	var setUIPageTab = function(tab) {
		current.page = tab;
		document.forms.header.elements.tab.value = tab;
		document.getElementById('page_body').className = tab;
		if (tab === 'outfitting')
			updateUIStatsPanels();
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
		var table = document.getElementById('popup_table');
		var status = document.getElementById('popup_status');
		var okay = document.forms.popup.elements.okay;
		var cancel = document.forms.popup.elements.cancel;
		labelarea.innerHTML = html || '';
		textarea.removeAttribute('style');
		table.style.display = 'none';
		status.innerHTML = '';
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
	
	
	var showUITablePopup = function(html, trigger, sticky, onOkay, onCancel) {
		var popup = document.getElementById('popup_modal');
		var labelarea = document.getElementById('popup_desc');
		var textarea = document.forms.popup.elements.textbox;
		var table = document.getElementById('popup_table');
		var status = document.getElementById('popup_status');
		var okay = document.forms.popup.elements.okay;
		var cancel = document.forms.popup.elements.cancel;
		labelarea.innerHTML = html || '';
		textarea.style.display = 'none';
		table.style.display = '';
		status.innerHTML = '';
		okay.style.display = (onOkay ? '' : 'none');
		cancel.style.display = (onCancel ? '' : 'none');
		var refocus = (sticky ? ((onOkay && okay) || (onCancel && cancel)) : null);
		if (!showUIPopup(popup, trigger, refocus, sticky, onOkay, onCancel))
			return false;
		if (onOkay) {
			okay.focus();
		} else if (onCancel) {
			cancel.focus();
		}
		return table;
	}; // showUITablePopup()
	
	
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
	
	
	var sortPrepRevAlpha = function(t) {
		var s = '';
		for (var i = 0;  i < t.length;  i++) {
			s += String.fromCharCode(65535 - t.charCodeAt(i));
		//	s += HASH_NUM_CHR[62 - HASH_NUM_CHR.indexOf(t[i])];
		}
		return s;
	}; // sortPrepReverseAlpha()
	
	var sortPrepLength = function(t) {
		return t.length;
	}; // sortPrepLength()
	
	var UI_SHIPYARD_COL = {
		label           : { header:'Build',           abbr:'Stored build label',                                        css:'text',sort:[String],       nochange:1,              render:function(build) { return build.getName(); } },
		name_ship       : { header:'Ship',            abbr:'Ship hull name',                                            css:'text',sort:[String],       nochange:1,              shipattr:'name' },
		cost            : { header:'Price',                                                                             css:'tar', sort:[parseNumText], attr:'cost',    scale:0, buildstat:'cost' },
		szcls           : { header:'Sz',              abbr:'Landing pad size',                                          css:'tac', sort:[sortPrepRevAlpha],                      render:function(build) { return '?SML'[(eddb.ship[build.getShipID()] || EMPTY_OBJ).class || 0]; } },
		crew            : { header:'Crw',                                                                               css:'tar', sort:[parseNumText], attr:'crew',             shipattr:'crew' },
		masslock        : { header:'MLF',                                                                               css:'tar', sort:[parseNumText], attr:'masslock',         shipattr:'masslock' },
		mass_hull       : { header:'Hull',            abbr:'Hull mass',                        colgroup:'Mass',         css:'tar', sort:[parseNumText], attr:'mass',    scale:0, buildstat:'mass_hull' },
		mass_unl        : { header:'Unl',             abbr:'Unladen mass',                     colgroup:'Mass',         css:'tar', sort:[parseNumText], attr:'mass',    scale:0, buildstat:'mass_unladen' },
		mass_ldn        : { header:'Ldn',             abbr:'Laden mass',                       colgroup:'Mass',         css:'tar', sort:[parseNumText], attr:'mass',    scale:0, buildstat:'mass_laden' },
		jump_unl        : { header:'Unl',             abbr:'Unladen jump range',               colgroup:'Jump',         css:'tar', sort:[parseNumText],                 scale:1, buildstat:'_jump_unladen' },
		jump_ldn        : { header:'Ldn',             abbr:'Laden jump range',                 colgroup:'Jump',         css:'tar', sort:[parseNumText],                 scale:1, buildstat:'_jump_laden' },
		range_unl       : { header:'Unl',             abbr:'Unladen fuel tank range',          colgroup:'Range',        css:'tar', sort:[parseNumText],                 scale:1, buildstat:'_range_unladen' },
		range_ldn       : { header:'Ldn',             abbr:'Laden fuel tank range',            colgroup:'Range',        css:'tar', sort:[parseNumText],                 scale:1, buildstat:'_range_laden' },
		topspd          : { header:'Spd',             abbr:'Thruster speed',                   colgroup:' ',            css:'tar', sort:[parseNumText], attr:'topspd',           buildstat:'_speed' },
		bstspd          : { header:'Bst',             abbr:'Boost speed',                      colgroup:' ',            css:'tar', sort:[parseNumText], attr:'bstspd',           buildstat:'_boost' },
		shields         : { header:'Shd',             abbr:'Shield strength',                  colgroup:'  ',           css:'tar', sort:[parseNumText], attr:'shields',          buildstat:'_shields' },
		armour          : { header:'Arm',             abbr:'Armour strength',                  colgroup:'  ',           css:'tar', sort:[parseNumText], attr:'armour',           buildstat:'_armour' },
		hardness        : { header:'Hrd',                                                      colgroup:'  ',           css:'tar', sort:[parseNumText], attr:'hardness',         shipattr:'hardness' },
		fuelcap         : { header:'Fuel',                                                     colgroup:' ',            css:'tar', sort:[parseNumText], attr:'fuelcap', scale:0, buildstat:'fuelcap' },
		cargocap        : { header:'Crgo',                                                     colgroup:' ',            css:'tar', sort:[parseNumText], attr:'cargocap',         buildstat:'cargocap' },
		cabincap        : { header:'Psgr',                                                     colgroup:' ',            css:'tar', sort:[parseNumText], attr:'cabincap',         buildstat:'cabincap' },
		slots_hardpoint : { header:'Hardpoints',      abbr:'Hardpoint mount sizes',            colgroup:'Module Slots', css:'tal', sort:[sortPrepRevAlpha,sortPrepLength],       render:function(build) { return formatShipyardSlots(build, 'hardpoint', 'USMLH'); } },
		slots_utility   : { header:'Utl',             abbr:'Number of utility mounts',         colgroup:'Module Slots ',css:'tac', sort:[parseNumText],                          render:function(build) { return eddb.ship[build.getShipID()].slots.utility.length; } },
		slots_core_0    : { header:CORE_SLOT_ABBR[0], abbr:(CORE_SLOT_NAME[0] + ' slot size'), colgroup:'Module Slots', css:'tac', sort:[parseNumText],                          render:function(build) { return eddb.ship[build.getShipID()].slots.component[0]; } },
		slots_core_1    : { header:CORE_SLOT_ABBR[1], abbr:(CORE_SLOT_NAME[1] + ' slot size'), colgroup:'Module Slots', css:'tac', sort:[parseNumText],                          render:function(build) { return eddb.ship[build.getShipID()].slots.component[1]; } },
		slots_core_2    : { header:CORE_SLOT_ABBR[2], abbr:(CORE_SLOT_NAME[2] + ' slot size'), colgroup:'Module Slots', css:'tac', sort:[parseNumText],                          render:function(build) { return eddb.ship[build.getShipID()].slots.component[2]; } },
		slots_core_3    : { header:CORE_SLOT_ABBR[3], abbr:(CORE_SLOT_NAME[3] + ' slot size'), colgroup:'Module Slots', css:'tac', sort:[parseNumText],                          render:function(build) { return eddb.ship[build.getShipID()].slots.component[3]; } },
		slots_core_4    : { header:CORE_SLOT_ABBR[4], abbr:(CORE_SLOT_NAME[4] + ' slot size'), colgroup:'Module Slots', css:'tac', sort:[parseNumText],                          render:function(build) { return eddb.ship[build.getShipID()].slots.component[4]; } },
		slots_core_5    : { header:CORE_SLOT_ABBR[5], abbr:(CORE_SLOT_NAME[5] + ' slot size'), colgroup:'Module Slots', css:'tac', sort:[parseNumText],                          render:function(build) { return eddb.ship[build.getShipID()].slots.component[5]; } },
		slots_core_6    : { header:CORE_SLOT_ABBR[6], abbr:(CORE_SLOT_NAME[6] + ' slot size'), colgroup:'Module Slots', css:'tac', sort:[parseNumText],                          render:function(build) { return eddb.ship[build.getShipID()].slots.component[6]; } },
		slots_core_7    : { header:CORE_SLOT_ABBR[7], abbr:(CORE_SLOT_NAME[7] + ' slot size'), colgroup:'Module Slots', css:'tac', sort:[parseNumText],                          render:function(build) { return eddb.ship[build.getShipID()].slots.component[7]; } },
		slots_military  : { header:'Mil',             abbr:'Military internal slot sizes',     colgroup:'Module Slots ',css:'tal', sort:[String,sortPrepLength],                 render:function(build) { return formatShipyardSlots(build, 'military');} },
		slots_internal  : { header:'Opt Internal',    abbr:'Optional internal slot sizes',     colgroup:'Module Slots', css:'tal', sort:[String,sortPrepLength],                 render:function(build) { return formatShipyardSlots(build, 'internal');} },
		dps             : { header:'DPS',             abbr:'Total DPS',                        colgroup:'Weapons',      css:'tar', sort:[parseNumText], attr:'dps',     scale:1, buildstat:'dps' },
		dps_abs         : { header:'Abs',             abbr:'Absolute DPS portion',             colgroup:'Weapons',      css:'tar', sort:[parseNumText],                          render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_abs') / dps, 0) : ''); } },
		dps_kin         : { header:'Kin',             abbr:'Kinetic DPS portion',              colgroup:'Weapons',      css:'tar', sort:[parseNumText],                          render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_kin') / dps, 0) : ''); } },
		dps_thm         : { header:'Thm',             abbr:'Thermal DPS portion',              colgroup:'Weapons',      css:'tar', sort:[parseNumText],                          render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_thm') / dps, 0) : ''); } },
		dps_exp         : { header:'Exp',             abbr:'Explosive DPS portion',            colgroup:'Weapons',      css:'tar', sort:[parseNumText],                          render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_exp') / dps, 0) : ''); } },
		dps_axe         : { header:'AXe',             abbr:'Anti-Xeno DPS portion',            colgroup:'Weapons',      css:'tar', sort:[parseNumText],                          render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_axe') / dps, 0) : ''); } },
		dps_cau         : { header:'Cau',             abbr:'Caustic DPS portion',              colgroup:'Weapons',      css:'tar', sort:[parseNumText],                          render:function(build) { var dps = build.getStat('dps'); return (dps ? formatPctHTML(build.getStat('dps_cau') / dps, 0) : ''); } },
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
		var table = document.createElement('table');
		table.id = 'shipyard_ships_table';
		table.className = 'striped';
		var thead = createUIShipyardHeader(UI_SHIPYARD_SHIPS_COLS, 'ships');
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
		document.getElementById('shipyard_ships_container').appendChild(table);
	}; // initUIShipyardShips()
	
	
	var initUIShipyardStoredBuilds = function() {
		var table = document.createElement('table');
		table.id = 'shipyard_storedbuilds_table';
		table.className = 'striped';
		var thead = createUIShipyardHeader(UI_SHIPYARD_STOREDBUILD_COLS, 'stored');
		table.appendChild(thead);
		var tbody = document.createElement('tbody');
		tbody.id = 'shipyard_storedbuilds_tbody';
		table.appendChild(tbody);
		document.getElementById('shipyard_storedbuilds_container').appendChild(table);
		if (current.beta) {
			var button = document.createElement('button');
			button.style.margin = '0.5em';
			button.style.padding = '0.125em 0.25em';
			button.innerHTML = 'Copy from Live Site';
			button.addEventListener('click', onUIShipyardStoredCopyLiveClick);
			document.getElementById('shipyard_storedbuilds_container').appendChild(button);
		}
	}; // initUIShipyardStoredBuilds()
	
	
	var onUIShipyardStoredCopyLiveClick = function(e) {
		e.stopPropagation();
		e.preventDefault();
		if (current.beta && confirm('Copy builds from live site storage?\nAny matching beta or dev site builds will be overwritten.')) {
			readStoredBuilds(true);
			updateUIShipyardStoredBuilds();
			updateUIFitStoredBuilds();
			updateUIAnalysisStoredBuilds();
			writeStoredBuilds();
		}
	}; // onUIShipyardStoredCopyLiveClick()
	
	
	var createUIShipyardHeader = function(columns, tab) {
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
					var span = document.createElement('span');
					span.innerHTML = (colgroup || '');
					th.appendChild(span);
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
			th.className = ((col.colgroup ? 'colgroup ': '') + ((col.colgroup != colgroup) ? 'first ' : '') + (col.css || '') + (c ? ' stickytop' : ' stickytopleft'));
			colgroup = col.colgroup;
			if (col.header) {
				var span = document.createElement('span');
				var abbr = document.createElement('abbr');
				abbr.innerHTML = col.header;
				abbr.title = (col.abbr || (cache.attribute[col.attr] || EMPTY_OBJ).desc || '');
				span.appendChild(abbr);
				if (col.sort) {
					var label = document.createElement('label');
					label.className = 'togglebutton';
					var input = document.createElement('input');
					input.type = 'radio';
					input.name = 'shipyard_' + tab + '_col';
					input.value = c;
					label.appendChild(input);
					var div = document.createElement('div');
					div.appendChild(span);
					label.appendChild(div);
					th.appendChild(label);
				} else {
					th.appendChild(span);
				}
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
			td.className = ((col.colgroup ? 'colgroup ': '') + ((col.colgroup != colgroup) ? 'first ' : '') + (col.css || '') + (c ? '' : ' stickyleft'));
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
			if (namehash && !current.stored.shipNamehashStored[0][namehash])
				tbody.removeChild(tbody.rows[r]);
		}
		
		// add or update all that currently exist
		var storeds = current.stored.shipStoreds[0];
		for (var i = 0;  i < storeds.length;  i++) {
			updateUIShipyardStoredBuild(storeds[i].namehash, null, true);
		}
		sortUIShipyardTable(document.getElementById('shipyard_storedbuilds_table'), UI_SHIPYARD_STOREDBUILD_COLS);
		
		return true;
	}; // updateUIShipyardStoredBuilds()
	
	
	var updateUIShipyardStoredBuild = function(namehash, build, sorted) {
		if (!namehash)
			return false;
		var stored = current.stored.shipNamehashStored[0][namehash];
		var tbody = document.getElementById('shipyard_storedbuilds_tbody');
		var tr = document.getElementById('shipyard_storedbuild.' + namehash);
		if (stored) {
			if (!build)
				build = Build.fromHash(stored.buildhash);
			if (!tr) {
				tr = createUIShipyardRow(UI_SHIPYARD_STOREDBUILD_COLS);
				tr.id = 'shipyard_storedbuild.' + namehash;
				tr.cells[0].innerHTML = '<button name="storedbuild_reload" value="'+namehash+'" class="label" title="'+encodeHTML(stored.name)+'">'+encodeHTML(stored.name)+'</button>';
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
		if (!sorted) {
			sortUIShipyardTable(document.getElementById('shipyard_storedbuilds_table'), UI_SHIPYARD_STOREDBUILD_COLS);
		}
		return true;
	}; // updateUIShipyardStoredBuild()
	
	
	var sortUIShipyardTable = function(table, columns, col, desc, alt) {
		if (!table || !columns)
			return null;
		
		// identify sort column, direction, and mode
		var state = (current.tableSort[table.id] || {});
		if (col === undefined) {
			col = min(max(state.col || 0, 0), columns.length - 1);
			desc = !!state.desc;
			alt = !!state.alt;
		} else {
			col = min(max(col, 0), columns.length - 1);
			if (desc === undefined) {
				if (col != state.col) {
					desc = false;
					alt = false;
				} else if (!state.desc) {
					desc = true;
					alt = state.alt;
				} else {
					desc = false;
					if (!state.alt && ((UI_SHIPYARD_COL[columns[col]] || EMPTY_OBJ).sort || EMPTY_ARR).length > 1) {
						alt = true;
					} else {
						alt = false;
					}
				}
			}
			state.col = col;
			state.desc = desc = !!desc;
			state.alt = alt = !!alt;
		}
		
		// sort rows
		var list = [];
		var sort1 = ((UI_SHIPYARD_COL[columns[col]] || EMPTY_OBJ).sort || EMPTY_ARR)[0];
		var sort2 = ((UI_SHIPYARD_COL[columns[col]] || EMPTY_OBJ).sort || EMPTY_ARR)[1];
		var tbody = table.tBodies[0];
		for (var r = 0;  r < tbody.rows.length;  r++) {
			var row = tbody.rows[r];
			var text = row.cells[col].innerText;
			var key1 = (sort1 ? sort1(text) : undefined);
			var key2 = (sort2 ? sort2(text) : undefined);
			list.push({ row:row, key:(alt ? key2 : key1), key2:(alt ? key1 : key2) });
		}
		list.sort(desc ? sortObjKeyDesc : sortObjKeyAsc);
		for (var r = 0;  r < list.length;  r++) {
			tbody.appendChild(list[r].row);
		}
		
		return state;
	}; // sortUIShipyardTable()
	
	
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
	* EXPORT/IMPORT
	*/
	
	
	var showUIExportPopup = function() {
		var trigger = document.getElementById('outfitting_fit_export');
		var table = showUITablePopup(null, trigger, false, false, false);
		table.className = '';
		while (table.lastChild)
			table.removeChild(table.lastChild);
		var tbody = document.createElement('tbody');
		
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('Build'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.colSpan = 2;
		var span = document.createElement('span');
		span.className = 'text';
		span.innerText = eddb.ship[current.fit.getShipID()].name;
		td.appendChild(span);
		var shipname = current.fit.getName();
		var shiptag = current.fit.getNameTag();
		td.appendChild(document.createTextNode((shipname ? (' "' + shipname + '"') : '') + (shiptag ? (' ' + shiptag) : '')));
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('URL'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.className = 'export';
		var div = document.createElement('div');
		div.className = 'export';
		var input = document.createElement('input');
		input.type = 'text';
		input.size = 50;
		input.className = 'export';
		input.name = 'export_url';
		input.value = current.fit.getEDSYURL();
		input.addEventListener('focus', onUIPopupExportFieldFocus);
		div.appendChild(input);
		td.appendChild(div);
		tr.appendChild(td);
		var td = document.createElement('td');
		var button = document.createElement('button');
		button.innerHTML = HTML_ICON['clipboard'];
		button.addEventListener('click', onUIPopupExportCopyButtonClick);
		td.appendChild(button);
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('Short'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.className = 'export';
		var div = document.createElement('div');
		div.className = 'export';
		var button = document.createElement('button');
		button.name = 'export_short_gen_button';
		button.className = 'text';
		button.innerHTML = 'Generate';
		button.addEventListener('click', onUIPopupExportShortButtonClick);
		div.appendChild(button);
		var input = document.createElement('input');
		input.style.display = 'none';
		input.type = 'text';
		input.size = 50;
		input.className = 'export';
		input.name = 'export_short';
		input.value = 'short';
		input.addEventListener('focus', onUIPopupExportFieldFocus);
		div.appendChild(input);
		td.appendChild(div);
		tr.appendChild(td);
		var td = document.createElement('td');
		var button = document.createElement('button');
		button.name = 'export_short_button';
		button.style.display = 'none';
		button.innerHTML = HTML_ICON['clipboard'];
		button.addEventListener('click', onUIPopupExportCopyButtonClick);
		td.appendChild(button);
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('Text'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.className = 'export';
		var div = document.createElement('div');
		div.className = 'export';
		var textarea = document.createElement('textarea');
		textarea.cols = 50;
		textarea.rows = 8;
		textarea.className = 'export';
		textarea.name = 'export_text';
		textarea.value = current.fit.exportText();
		textarea.addEventListener('focus', onUIPopupExportFieldFocus);
		div.appendChild(textarea);
		td.appendChild(div);
		tr.appendChild(td);
		var td = document.createElement('td');
		var button = document.createElement('button');
		button.innerHTML = HTML_ICON['clipboard'];
		button.addEventListener('click', onUIPopupExportCopyButtonClick);
		td.appendChild(button);
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('SLEF'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.className = 'export';
		var div = document.createElement('div');
		div.className = 'export';
		var input = document.createElement('input');
		input.type = 'text';
		input.size = 50;
		input.className = 'export';
		input.name = 'export_slef';
		input.value = current.fit.exportSLEF();
		input.addEventListener('focus', onUIPopupExportFieldFocus);
		div.appendChild(input);
		td.appendChild(div);
		tr.appendChild(td);
		var td = document.createElement('td');
		var button = document.createElement('button');
		button.innerHTML = HTML_ICON['clipboard'];
		button.addEventListener('click', onUIPopupExportCopyButtonClick);
		td.appendChild(button);
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		var export_eddbio = current.fit.getEDDBioURL();
		var export_inara = current.fit.getInaraURL();
		var export_edomh = current.fit.exportEDOMH();

		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('External'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.className = 'export';
		var div = document.createElement('div');
		div.className = 'export';
		var link = document.createElement('a');
		link.className = 'button text';
		if (export_eddbio) {
			link.href = export_eddbio;
			link.target = '_blank';
		}
		link.innerHTML = '<img src="eddbio.png" class="iconsvg"> EDDB.io';
		div.appendChild(link);
		if (export_inara) {
			var button = document.createElement('button');
			button.className = 'text';
			button.name = 'export_inara';
			button.innerHTML = '<img src="inara.png"> Inara';
			button.addEventListener('click', onUIFitExportInaraButtonClick);
			div.appendChild(button);
		}
		var link = document.createElement('a');
		link.className = 'button text';
		if (export_edomh) {
			link.href = "edomh://edsy/?" + b64Encode(pako.deflate(JSON.stringify(export_edomh), {to:'string'}));;
			link.target = '_blank';
		}
		link.innerHTML = '<img src="edomh.png" class="iconsvg"> EDOMH';
		div.appendChild(link);
		td.appendChild(div);
		tr.appendChild(td);
		var td = document.createElement('td');
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		table.appendChild(tbody);
		document.forms.popup.elements.export_url.focus();
		document.forms.popup.elements.export_url.select();
		return true;
	}; // showUIExportPopup()
	
	
	var showUIImportPopup = function() {
		var prefix = 'edsy' + (current.dev ? 'dev' : '') + '_fdapi_cmdr_';
		var cookies = getCookies(prefix + '[A-Za-z0-9_-]+');
		var cmdrs = [];
		var cmdr64 = {};
		for (var name in cookies) {
			var c64 = name.slice(prefix.length);
			var c = b64Decode(c64);
			if (c) {
				cmdrs.push(c);
				cmdr64[c] = c64;
			}
		}
		var html = [
			'You can import your current ship (and any others used today) directly from the Frontier API.<br>You must log in with Frontier to grant access, but EDSY will never see your password.',
			'<ul>',
		];
		if (cmdrs.length > 0) {
			cmdrs.sort();
			for (i = 0;  i < cmdrs.length;  i++)
				html.push('<li><button name="fdapi_import" value="' + encodeHTML(cmdr64[cmdrs[i]]) + '">Import</button> <button name="fdapi_delete" value="' + encodeHTML(cmdr64[cmdrs[i]]) + '">Remove</button> CMDR ' + encodeHTML(cmdrs[i]) + '</li>');
		}
		html.push('<li><a href="fdapi?auth=A">Authorize ' + (cmdrs.length ? 'Another ' : '') + 'Account <svg class="iconsvg xref"><use xlink:href="#icon_xref"/></svg></a></li>');
		html.push('</ul>');
		html.push('You can also import loadout(s) by pasting them below or dropping a file onto the page.');
		showUITextPopup(
				html.join("\n"),
				(
					'Supported import formats include:\n\n' +
					'* EDSY URL(s)\n' +
					'* EDSY backup export\n' +
					// TODO: text exports?
					// TODO: coriolis
					'* SLEF JSON data (from Inara, Coriolis, etc)\n' +
					'* Journal JSONL data with "Loadout" event(s)\n' +
					'* Frontier API Profile JSON data (via EDAPI, EDCE, EDMC, etc)\n'
				),
				null, false,
				importData, true
		);
		for (var i = 0;  i < document.forms.popup.elements.length;  i++) {
			var button = document.forms.popup.elements[i];
			if (button.name === 'fdapi_import' || button.name === 'fdapi_delete' || button.name === 'fdapi_auth')
				button.addEventListener('click', onUIPopupImportButtonClick);
		}
	}; // showUIImportPopup()
	
	
	var importFromAPI = function(cmdr64) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				hideUIPopup();
				var response = null;
				try {
					response = JSON.parse(request.responseText);
					if (current.dev)
						console.log('FDAPI: ' + request.status + '/' + response.status + ', ' + typeof(response['import']));
				} catch (exc) {
					response = null;
					console.log('FDAPI: ' + request.status + '; ' + exc);
					if (current.dev)
						console.log(request.response);
				}
//request={status:200};response={location:'foo'};
//request={status:500};response={};
				if (request.status == 200) {
					if (!response) {
						alert("EDSY-FDAPI connector error");
					} else if (response['location']) {
						showUITextPopup(
								(
									'EDSY\'s API access for this account has expired or been reset.' +
									'<ul><li><a href="' + encodeHTML(response['location']) + '">Re-Authorize Account <svg class="iconsvg xref"><use xlink:href="#icon_xref"/></svg></a></li></ul>'
								),
								null,
								null, true,
								false, true
						);
					} else if (response.status == 206 && confirm('Frontier API returned incomplete data.\n\nThis is common after long sessions; re-try?')) {
					//	setTimeout(function() { importFromAPI(cmdr64); }, 1);
						importFromAPI(cmdr64);
					} else if (response['import']) {
						importData(response['import']);
					} else {
						alert("Frontier API returned no builds.\n\nThis may happen if you haven't played lately,\nor it may be a temporary error.");
					}
				} else {
					var status = (response || EMPTY_OBJ)['status'];
					var message = (status ? ('Frontier API error ' + request.status + '/' + status) : ('EDSY-FDAPI connector error ' + request.status));
					showUITextPopup(
							(
								message +
								'<br><br>' +
								'You can try re-authorizing EDSY\'s API access, but if the<br>' +
								'error persists then there may be a temporary API outage.' +
								'<ul><li><a href="fdapi?auth=I">Re-Authorize Account <svg class="iconsvg xref"><use xlink:href="#icon_xref"/></svg></a></li></ul>'
							),
							null,
							null, true,
							false, true
					);
				}
			}
		}; // onreadystatechange()
		var onCancel = function() {
			request.onreadystatechange = function() {};
			request.abort();
		}; // onCancel()
		showUITextPopup('Querying Frontier API ...<br><center><img src="loading.svg"></center>', null, null, true, null, onCancel);
		request.open('GET', 'fdapi?c=' + encodeURIComponent(cmdr64), true);
		request.timeout = 10000;
		request.send();
	}; // importFromAPI()
	
	
	var createUIImportedBuildHeader = function() {
		var thead = document.createElement('thead');
		var tr = document.createElement('tr');
		
		var th = document.createElement('th');
		th.className = 'colgroup stickytopleft';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Ship';
		abbr.title = 'Ship type';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'colgroup tac stickytop';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = '#';
		abbr.title = 'Ship purchase number';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'colgroup stickytop';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Name';
		abbr.title = 'Ship name';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'colgroup stickytop';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'ID';
		abbr.title = 'Ship ID tag';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'colgroup stickytop tac';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Err';
		abbr.title = 'Import errors';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'colgroup first stickytop';
		var actions = ['ignore','save','saveas'];
		for (var a = 0;  a < actions.length;  a++) {
			var button = document.createElement('button');
			button.className = 'import_' + actions[a];
			button.name = 'import_' + actions[a];
			button.innerHTML = HTML_ICON[actions[a]];
			button.addEventListener('click', onUIPopupImportButtonClick);
			th.appendChild(button);
		}
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Label';
		abbr.title = 'Stored build label';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'colgroup first stickytop';
		var button = document.createElement('button');
		button.name = 'import_load_none';
		button.innerHTML = HTML_ICON['import'];
		button.addEventListener('click', onUIPopupImportButtonClick);
		th.appendChild(button);
		tr.appendChild(th);
		
		thead.appendChild(tr);
		return thead;
	}; // createUIImportedBuildHeader()
	
	
	var createUIImportedBuildRow = function(importobj, multiple) {
		var index = importobj.index;
		var fleetid = importobj.fleetid;
		var build = importobj.build;
		var shipid = (build ? build.getShipID() : -1);
		var builderrors = importobj.builderrors;
		var namehash = importobj.namehash || '';
		var defaultaction = ((build && namehash) ? ((current.stored.shipNamehashStored[shipid] || EMPTY_OBJ)[namehash] ? 'save' : (multiple ? 'saveas' : 'ignore')) : 'ignore');
		
		var tr = document.createElement('tr');
		
		var td = document.createElement('td');
		td.className = 'colgroup text stickyleft';
		td.innerHTML = (build ? eddb.ship[shipid].name : '');
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.className = 'colgroup tac';
		td.innerHTML = (fleetid || '');
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.className = 'colgroup';
		td.innerHTML = (build ? encodeHTML(build.getName()) : '');
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.className = 'colgroup';
		td.innerHTML = (build ? encodeHTML(build.getNameTag()) : '');
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.className = 'colgroup tac';
		if (builderrors.length > 0) {
			var abbr = document.createElement('abbr');
			abbr.innerHTML = builderrors.length;
			abbr.title = builderrors.join('\n');
			td.appendChild(abbr);
		} else {
			td.innerHTML = '0';
		}
		tr.appendChild(td);
		
		// prepare the select now, so we can make sure it has entries
		var select = document.createElement('select');
		select.className = 'import_save_label';
		select.name = 'import_save_label_' + index;
		var option = document.createElement('option');
		option.value = '';
		option.text = '';
		select.appendChild(option);
		populateDOMSelectStoreds(select, current.stored.shipStoreds[shipid], namehash, 1);
		if (select.options.length < 2) {
			if (defaultaction === 'save')
				defaultaction = 'saveas';
		}
		
		var td = document.createElement('td');
		td.className = 'colgroup first import_store';
		var div = document.createElement('div');
		div.className = 'import_store';
		var actions = ['ignore','save','saveas'];
		for (var a = 0;  a < actions.length;  a++) {
			var input = document.createElement('input');
			input.id = 'import_store_' + index + '_' + actions[a];
			input.className = 'toggleinput import_' + actions[a];
			input.type = 'radio';
			input.name = 'import_store_' + index;
			input.value = actions[a];
			input.checked = (actions[a] == defaultaction);
			input.disabled = (actions[a] === 'save' && select.options.length < 2) || (actions[a] !== 'ignore' && !build);
			div.appendChild(input);
			var label = document.createElement('label');
			label.className = 'togglebutton';
			label.htmlFor = input.id;
			label.innerHTML = HTML_ICON[actions[a]];
			div.appendChild(label);
		}
		var span = document.createElement('span');
		span.className = 'import_ignore_label';
		span.innerHTML = 'Not saved';
		div.appendChild(span);
		div.appendChild(select);
		var input = document.createElement('input');
		input.className = 'import_saveas_label';
		input.type = 'text';
		input.name = 'import_saveas_label_' + index;
		input.value = hashDecodeS(namehash);
		div.appendChild(input);
		var abbr = document.createElement('abbr');
		abbr.id = 'import_warning_' + index;
		abbr.style.display = 'none';
		abbr.innerHTML = HTML_ICON['warning'];
		abbr.title = '';
		div.appendChild(abbr);
		td.appendChild(div);
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.className = 'colgroup first';
		var input = document.createElement('input');
		input.id = 'import_load_' + index;
		input.className = 'toggleinput';
		input.type = 'radio';
		input.name = 'import_load';
		input.value = index;
		input.disabled = !build;
		td.appendChild(input);
		var label = document.createElement('label');
		label.className = 'togglebutton';
		label.htmlFor = input.id;
		label.innerHTML = HTML_ICON['import'];
		td.appendChild(label);
		tr.appendChild(td);
		
		return tr;
	}; // createUIImportedBuildRow()
	
	
	var importData = function(text, msieURLtrunc) {
		// if it's valid (optionally URI-encoded) base64, assume it's also gzipped
		var b64text = null;
		try {
			b64text = decodeURIComponent(text.replace(/[ \t\r\n]+/g, ''));
			var gztext = pako.inflate(b64Decode(b64text), {to:'string'});
			text = gztext;
		} catch (exc) {
			b64text = null;
		}
		text = text.trim();
		if (!text)
			return true;
		if (current.dev)
			console.log(text);
		
		// initialize storage for possibly decoding multiple builds
		var errors = [];
		var importdata = {
			imports: null,
			buildlist: [],
			modules: null,
		};
		var curindex = -1;
		
		// identify the format by the first line
		var eol = text.indexOf('\n');
		var line1 = text.slice(0, (eol < 0) ? 100 : eol).trim();
		if (line1.toUpperCase().slice(0,5) === 'FDAPI') {
			var cmdr64 = line1.split(':')[1];
			if (cmdr64) {
				importFromAPI(cmdr64);
			} else {
				showUIImportPopup();
			}
			return true;
		} else if (line1.match(/^[a-z]+:\/\/[^#]*(edshipyard|edsy)[^#]*#/i)) { // URL hash(es)
			var urls = text.match(/[a-z]+:\/\/[^#]+#[^ \t\r\n#]*/ig);
			for (var i = 0;  i < urls.length;  i++) {
				var urlhash = urls[i].slice(urls[i].indexOf('#'));
				var parts = urlhash.split('/');
				if (parts[0] === '#') {
					for (var p = 1;  p < parts.length;  p++) {
						if (parts[p].slice(0,2) === 'L=') {
							var index = importdata.buildlist.length;
							var builderrors = [];
							var build = Build.fromHash(parts[p].slice(2), builderrors);
							var importhash = build ? ('url|' + build.getShipID() + '|' + hashEncodeS(build.getName().toUpperCase()) + '|' + hashEncodeS(build.getNameTag().toUpperCase())) : null;
							importdata.buildlist[index] = { index:index, importhash:importhash, fleetid:null, namehash:null, build:build, builderrors:builderrors };
							if (build)
								curindex = index;
						} else if (parts[p].slice(0,2) === 'I=') {
							errors.push('Nested import URL hash: ' + urlhash.slice(0,8) + (urlhash.length > 8 ? '...' : ''));
						}
					}
				} else {
					errors.push('Invalid URL hash: ' + urlhash.slice(0,8) + (urlhash.length > 8 ? '...' : ''));
				}
			}
		} else if (line1.match(/^\[[ a-z0-9_-]+(,[^\[\]]+)?\] *(\[[^\[\]]+\])?$/i)) { // plain text
			// TODO: plain text import? does anybody actually use it?
			errors.push('Plain text import is not yet implemented');
		} else if (line1[0] === '[' || line1[0] === '{') {
			var json = null;
			try {
				json = JSON.parse(text);
			} catch (exc) {
				json = null;
			}
			if (!json) {
				try {
					// maybe it's line-delimited (i.e. a full Journal file)
					text = '[ '+text.replace(/\}[ \t]*[\r\n]+[ \t]*\{/g,'}, {')+' ]';
					json = JSON.parse(text);
				} catch (exc) {
					json = null;
				}
			}
			if (json) {
				if (json['format'] === 'edsy') { // EDSY backup
					if (json['imports']) {
						importdata.imports = importdata.imports || {};
						for (var importhash in json['imports']) {
							importdata.imports[importhash] = json['imports'][importhash];
						}
					}
					for (var i = 0;  i < (json['buildlist'] || EMPTY_ARR).length;  i++) {
						var index = importdata.buildlist.length;
						var builderrors = [];
						var namehash = json['buildlist'][i]['label'];
						var build = Build.fromHash(json['buildlist'][i]['hash'], builderrors);
						importdata.buildlist[index] = { index:index, importhash:null, fleetid:null, namehash:namehash, build:build, builderrors:builderrors };
					}
					for (var namehash in (json['builds'] || EMPTY_OBJ)) {
						var index = importdata.buildlist.length;
						var builderrors = [];
						var build = Build.fromHash(json['builds'][namehash], builderrors);
						importdata.buildlist[index] = { index:index, importhash:null, fleetid:null, namehash:namehash, build:build, builderrors:builderrors };
					}
					if (json['modules']) {
						importdata.modules = importdata.modules || {};
						for (var namehash in json['modules']) {
							importdata.modules[namehash] = json['modules'][namehash];
						}
					}
					importdata.options = json['options'];
					curindex = -1;
				} else if (json.length > 0 && (json[0]['header'] || EMPTY_OBJ)['appName'] && (json[0]['data'] || EMPTY_OBJ)['Ship']) { // EDCD SLEF
					for (var i = 0;  i < json.length;  i++) {
						var slefApp = ((json[i]['header'] || EMPTY_OBJ)['appName'] || '').trim();
						var index = importdata.buildlist.length;
						var builderrors = [];
						var build = Build.fromJournal(json[i]['data'], builderrors, json[i]['header']);
						var importhash = build ? ('slef|' + hashEncodeS(slefApp || '') + '|' + build.getShipID() + '|' + hashEncodeS(build.getName().toUpperCase()) + '|' + hashEncodeS(build.getNameTag().toUpperCase())) : null;
						importdata.buildlist[index] = { index:index, importhash:importhash, fleetid:null, namehash:null, build:build, builderrors:builderrors };
						if (build) {
							curindex = index;
							if (slefApp.toUpperCase() === 'INARA') {
								importdata.warning = 'Inara builds may have small inaccuracies in engineered module attributes';
							}
						}
					}
				} else if (((json['$schema'] || ((json[0] || EMPTY_OBJ)['$schema'])) || '').indexOf('coriolis.io') >= 0) { // Coriolis detailed export
					// TODO: coriolis import
					errors.push('Coriolis import is not yet implemented');
				} else if (json['event'] || (json[0] || EMPTY_OBJ)['event']) { // journal event(s)
					if (isNaN(json.length)) {
						json = [ json ];
					}
					// scan it backwards so that the order reflects the most recent event for each ship
					var fleetids = {};
					var slotCraft = null;
					var i = json.length;
					while (i-- > 0) {
						if (json[i]['event'] === 'EngineerCraft') {
							var slot = json[i]['Slot'];
							if (!slotCraft)
								slotCraft = {};
							if (!slotCraft[slot])
								slotCraft[slot] = json[i];
						} else if (json[i]['event'] === 'Loadout') {
							var fleetid = json[i]['ShipID'] || -i;
							if (!fleetids[fleetid]) {
								for (var s = 0;  s < json[i]['Modules'].length;  s++) {
									var slot = json[i]['Modules'][s]['Slot'];
									if ((slotCraft || EMPTY_OBJ)[slot] && slotCraft[slot]['Module'].toLowerCase() === json[i]['Modules'][s]['Item'].toLowerCase()) {
										json[i]['Modules'][s]['Engineering'] = slotCraft[slot];
									}
								}
								var index = importdata.buildlist.length;
								var builderrors = [];
								var build = Build.fromJournal(json[i], builderrors);
								var importhash = build ? ('journal|' + build.getShipID() + '|' + max(0,fleetid) + '|' + hashEncodeS(build.getName().toUpperCase()) + '|' + hashEncodeS(build.getNameTag().toUpperCase())) : null;
								importdata.buildlist[index] = { index:index, importhash:importhash, fleetid:fleetid, namehash:null, build:build, builderrors:builderrors };
								fleetids[fleetid] = true;
							}
							slotCraft = null;
						}
					}
					// now reverse the imports to restore the original journal order
					importdata.buildlist.reverse();
					for (var i = 0;  i < importdata.buildlist.length;  i++) {
						importdata.buildlist[i].index = i;
						if (importdata.buildlist[i].build)
							curindex = i;
					}
				} else if ((json['name'] && json['modules']) || json['ship'] || json['ships']) { // FDAPI /profile endpoint
					var fleetid = (json['id'] || (json['ship'] || EMPTY_OBJ)['id']);
					if (json['name'] && json['modules']) {
						var shipobj = json;
						json = { ships:{} };
						json['ships'][fleetid] = shipobj;
					} else if (json['ship']) {
						json['ships'] = json['ships'] || {};
						json['ships'][fleetid] = json['ship'];
					}
					var fleetids = Object.keys(json['ships']);
					fleetids.sort(sortNumbers);
					for (var i = 0;  i < fleetids.length;  i++) {
						var shipobj = json['ships'][fleetids[i]];
						if (shipobj["name"] && shipobj["modules"]) {
							var index = importdata.buildlist.length;
							var builderrors = [];
							var build = Build.fromCAPI(shipobj, builderrors);
							var importhash = build ? ('fdapi|' + build.getShipID() + '|' + max(0,fleetids[i]) + '|' + hashEncodeS(build.getName().toUpperCase()) + '|' + hashEncodeS(build.getNameTag().toUpperCase())) : null;
							importdata.buildlist[index] = { index:index, importhash:importhash, fleetid:fleetids[i], namehash:null, build:build, builderrors:builderrors };
							importdata.warning = 'These FDAPI builds may erroneously show legacy blueprints on all engineered modules';
							if (build && fleetids[i] == fleetid)
								curindex = index;
						}
					}
				} else {
					errors.push('Unrecognized JSON format');
				}
			} else {
				errors.push('Invalid JSON encoding');
				if (msieURLtrunc)
					errors.push('URL likely truncated by Windows and/or Internet Explorer');
			}
		} else {
			errors.push('Unrecognized format');
		}
		
		// see what we got
		var imported = false;
		if (importdata.buildlist.length > 0 || importdata.imports || importdata.modules) {
			current.importdata = importdata;
			var html = 'Found ' + importdata.buildlist.length + ' build(s). Choose which to save to your stored builds, and/or which to load now, if any.';
			var trigger = document.getElementById('outfitting_fit_import');
			var table = showUITablePopup(html, trigger, true, importDataOkay, importDataCancel);
			table.className = 'striped';
			while (table.lastChild)
				table.removeChild(table.lastChild);
			table.appendChild(createUIImportedBuildHeader());
			var tbody = document.createElement('tbody');
			for (var i = 0;  i < importdata.buildlist.length;  i++) {
				var importbuild = importdata.buildlist[i];
				// if a namehash wasn't provided, try the importhash history or generate a default label
				if (!importbuild.namehash) {
					if (importbuild.importhash && (importbuild.importhash in current.importLabel)) {
						importbuild.namehash = current.importLabel[importbuild.importhash];
					} else if (importbuild.build) {
						importbuild.namehash = hashEncodeS(eddb.ship[importbuild.build.getShipID()].name + (importbuild.fleetid ? (' #' + importbuild.fleetid) : ''));
					}
				}
				tbody.appendChild(createUIImportedBuildRow(importbuild, importdata.buildlist.length > 1));
			}
			table.appendChild(tbody);
			var el = document.getElementById('import_load_' + curindex);
			if (el && !el.disabled)
				el.checked = true;
			
			var numModules=0, numModulesOW=0, extras=false;
			extras = importdata.imports || importdata.modules || importdata.options;
			for (var namehash in (importdata.modules || EMPTY_OBJ)) {
				// skip builtins, if they snuck in somehow
				if (!hashDecodeS(namehash).startsWith(" ")) {
					numModules += 1;
					numModulesOW += (current.stored.moduleNamehashStored[0][namehash] ? 1 : 0);
				}
			}
			if (extras) {
				var status = document.getElementById('popup_status');
				var label = document.createElement('label');
				label.className = 'checkbox left';
				var input = document.createElement('input');
				input.type = 'checkbox';
				input.name = 'import_extras';
				input.checked = true;
				label.appendChild(input);
				var div = document.createElement('div');
				var divCheck = document.createElement('div');
				divCheck.className = 'check';
				div.appendChild(divCheck);
				div.appendChild(document.createTextNode(' Also store imported preferences and ' + numModules + ' imported modules (overwriting ' + numModulesOW + ').'));
				label.appendChild(div);
				status.appendChild(label);
			}
			
			if (importdata.warning) {
				var status = document.getElementById('popup_status');
				var div = document.createElement('div');
				div.innerHTML = HTML_ICON['warning'] + ' ' + importdata.warning;
				status.appendChild(div);
			}
			
			imported = true;
		/* always use bulk import window
		} else if (importdata.buildlist.length == 1) {
			var importbuild = importdata.buildlist[0];
			if (importbuild.build) {
				setCurrentFit(importbuild.build);
				if (importbuild.builderrors.length > 0) {
					alert('Build imported with errors:\n\n' + importbuild.builderrors.join('\n'))
				}
				imported = true;
			} else {
				alert('Import failed:\n\n' + importbuild.builderrors.join('\n'));
			}
		*/
		} else {
			errors.push('No builds found');
			alert('Import failed:\n\n' + errors.join('\n'));
		}
		return imported;
		/*
				b64text = text; // TODO debug
				if (!b64text) {
					try {
						b64text = text.replace(/[ \t\r\n]+/g, '');
						b64text = b64Encode(pako.gzip(b64text, {to:'string'}));
						b64text = b64text.replace(/.{80}/g, function(a) { return a+'\n'; });
					} catch (exc) {
						b64text = text;
					}
					
				}
		*/
	}; // importData()
	
	
	var importDataOkay = function() {
		var ok = true;
		var namehashIndex = {};
		for (var i = 0;  i < current.importdata.buildlist.length;  i++) {
			var importbuild = current.importdata.buildlist[i];
			var message = '';
			var input_action = document.forms.popup.elements['import_store_' + i];
			var label_save = document.forms.popup.elements['import_save_label_' + i];
			var label_saveas = document.forms.popup.elements['import_saveas_label_' + i];
			var namehash = '';
			if (!importbuild.build) {
				// no build to store
			} else if (input_action.value === 'save') {
				namehash = label_save.value.trim();
				if (!namehash) {
					message = 'Select a label for the stored build.';
				}
			} else if (input_action.value === 'saveas') {
				namehash = hashEncodeS(label_saveas.value.trim());
				if (!namehash) {
					message = 'Specify a label for the stored build.';
				} else if (current.stored.shipNamehashStored[0][namehash]) {
					message = 'The specified stored build label already exists; it will be overwritten.';
					input_action.value = 'save';
					label_save.value = namehash;
					if (label_save.selectedIndex < 1) {
						var option = document.createElement('option');
						option.value = namehash;
						option.text = label_saveas.value.trim();
						option.selected = true;
						label_save.appendChild(option);
					}
				}
			}
			if (!namehash) {
				// don't store this build
				importbuild.namehash = namehash;
			} else if (namehashIndex[namehash]) {
				message = 'Cannot import multiple builds with the same label.';
			} else {
				namehashIndex[namehash] = i;
				importbuild.namehash = namehash;
			}
			var warning = document.getElementById('import_warning_' + i);
			warning.title = message;
			warning.style.display = message ? 'block' : 'none';
			ok = ok && !message;
		}
		if (ok) {
			var input_extras = document.forms.popup.elements['import_extras'];
			if (input_extras && input_extras.checked) {
				for (var importhash in (current.importdata.imports || EMPTY_OBJ)) {
					setStoredImport(importhash, current.importdata.imports[importhash]);
				}
				for (var namehash in (current.importdata.modules || EMPTY_OBJ)) {
					// skip builtins
					var name = hashDecodeS(namehash);
					if (!name.startsWith(" ")) {
						var modulehash = current.importdata.modules[namehash];
						var modid = Slot.getStoredHashModuleID(modulehash);
						var stored = {
							modid:modid,
							namehash:namehash,
							name:name,
							modulehash:modulehash
						};
						if (!current.stored.moduleNamehashStored[modid])
							current.stored.moduleNamehashStored[modid] = {};
						current.stored.moduleNamehashStored[0][namehash] = current.stored.moduleNamehashStored[modid][namehash] = stored;
						current.stored.moduleStoreds[0] = current.stored.moduleStoreds[modid] = null;
					}
				}
				for (var modid in current.stored.moduleNamehashStored) {
					if (!current.stored.moduleStoreds[modid]) {
						current.stored.moduleStoreds[modid] = Object.values(current.stored.moduleNamehashStored[modid]);
						current.stored.moduleStoreds[modid].sort(sortStoreds);
					}
				}
				for (var opt in (current.importdata.options || EMPTY_OBJ)) {
					if (current.option[opt] !== undefined)
						current.option[opt] = current.importdata.options[opt];
				}
			}
			for (var i = 0;  i < current.importdata.buildlist.length;  i++) {
				var importbuild = current.importdata.buildlist[i];
				if (importbuild.importhash) {
					setStoredImport(importbuild.importhash, importbuild.namehash);
				}
				if (importbuild.build && importbuild.namehash) {
					var shipid = importbuild.build.getShipID();
					var buildhash = importbuild.build.getHash();
					var stored = {
						shipid:shipid,
						namehash:importbuild.namehash,
						name:hashDecodeS(importbuild.namehash),
						buildhash:buildhash
					};
					if (!current.stored.shipNamehashStored[shipid])
						current.stored.shipNamehashStored[shipid] = {};
					current.stored.shipNamehashStored[0][importbuild.namehash] = current.stored.shipNamehashStored[shipid][importbuild.namehash] = stored;
					current.stored.shipStoreds[0] = current.stored.shipStoreds[shipid] = null;
				}
			}
			for (var shipid in current.stored.shipNamehashStored) {
				if (!current.stored.shipStoreds[shipid]) {
					current.stored.shipStoreds[shipid] = Object.values(current.stored.shipNamehashStored[shipid]);
					current.stored.shipStoreds[shipid].sort(sortStoreds);
				}
			}
			writeStoredOptions();
			writeStoredImports();
			writeStoredBuilds();
			writeStoredModules();
			updateUIOptions();
			updateUIShipyardStoredBuilds();
			var build = (current.importdata.buildlist[document.forms.popup.elements.import_load.value] || EMPTY_OBJ).build;
			if (build) {
				setCurrentFit(build);
				setUIPageTab('outfitting');
			} else {
				updateUIFitStoredBuilds();
			}
			updateUIModulePickerStoredModules();
			updateUIDetailsStoredModules();
			updateUIDetailsStoredModuleControls();
			updateUIAnalysisStoredBuilds();
			current.importdata = null;
		} else {
			var html = 'Some choices were invalid; hover over the warning icon for details.';
			var trigger = document.getElementById('outfitting_fit_import');
			showUITablePopup(html, trigger, true, importDataOkay, importDataCancel);
		}
	}; // importDataOkay()
	
	
	var importDataCancel = function() {
		current.importdata = null;
	}; // importDataCancel()
	
	
	var getFdevImportMap = function() {
		if (!cache.fdevmap) {
			var fdevmap = {
				ship: {},
				slotGroup: {
					HUGEHARDPOINT    : 'hardpoint',
					LARGEHARDPOINT   : 'hardpoint',
					MEDIUMHARDPOINT  : 'hardpoint',
					SMALLHARDPOINT   : 'hardpoint',
					TINYHARDPOINT    : 'utility',
					MILITARY         : 'military',
					SLOT             : 'internal',
				},
				slotNum: {},
				shipModule: {},
				module: {},
				mtypeBlueprint: {},
				expeffect: {},
				attrField: {},
				fieldAttr: {},
			};
			for (var s = 0;  s < CORE_SLOT_FDNAME.length;  s++) {
				fdevmap.slotGroup[CORE_SLOT_FDNAME[s].toUpperCase()] = 'component';
				fdevmap.slotNum[CORE_SLOT_FDNAME[s].toUpperCase()] = s;
			}
			
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
			
			// obsolete modules
			fdevmap.module['INT_STELLARBODYDISCOVERYSCANNER_STANDARD'] = -1;
			fdevmap.module['INT_STELLARBODYDISCOVERYSCANNER_INTERMEDIATE'] = -1;
			fdevmap.module['INT_STELLARBODYDISCOVERYSCANNER_ADVANCED'] = -1;
			
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
			
			// expeffect mappings are (now) bi-directional
			for (var expid in eddb.expeffect) {
				var fdexpid = eddb.expeffect[expid].fdname;
				if (fdexpid)
					fdevmap.expeffect[fdexpid.toUpperCase()] = expid;
			}
			
			// attr mappings are (now) bi-directional, except for some special cases
			for (var i = 0;  i < eddb.attributes.length;  i++) {
				var attribute = eddb.attributes[i];
				if (attribute.attr)
					fdevmap.attrField[attribute.attr] = attribute.fdattr;
				if (attribute.fdattr)
					fdevmap.fieldAttr[attribute.fdattr] = attribute.attr;
			}
			for (var fdattr in eddb.fdfieldattr) {
				var attr = eddb.fdfieldattr[fdattr];
				fdevmap.fieldAttr[fdattr] = attr;
			}
			
			cache.fdevmap = fdevmap;
		}
		return cache.fdevmap;
	}; // getFdevImportMap()
	
	
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
				
				var divRow, divFlex, moduleSize, moduleAbbrev;
				for (var m = 0;  m <= cache.mtypeModules[mtype].length;  m++) {
					var mID = cache.mtypeModules[mtype][m];
					var module = eddb.module[mID];
					var nextSize = ((module || EMPTY_OBJ).class || 0) | 0;
					var nextAbbrev = eddb.mtype[mtype].modulenames[(module || EMPTY_OBJ).name];
					// close the running row when the size class or abbreviation changes (except for shield generators), or if unabbreviated
					if (divRow && (!module || moduleSize !== nextSize || (moduleAbbrev !== nextAbbrev && (typeof moduleAbbrev !== 'string' || mtype !== 'isg')) || !nextAbbrev)) {
						divType.appendChild(divRow);
						divRow = null;
					}
					if (module) {
						moduleSize = nextSize;
						moduleAbbrev = nextAbbrev;
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
						label.className = 'togglebutton' + (moduleAbbrev ? ((typeof moduleAbbrev !== 'string') ? '' : ' shortname') : ' fullname');
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
		var nameNamehash = current.pickerNameNamehash;
		current.pickerNameNamehash = {};
		for (var namehash in current.stored.moduleNamehashStored[0]) {
			nameNamehash[current.stored.moduleNamehashStored[0][namehash].name] = namehash;
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
		var stored = current.stored.moduleNamehashStored[0][namehash];
		var divRow = document.getElementById('outfitting_modules_stored.' + namehash);
		if (stored) {
			current.pickerNameNamehash[stored.name] = namehash;
			var module = eddb.module[stored.modid];
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
				if (stored.name.startsWith(" ")) {
					classes += ' builtin';
				}
				divRow.className = classes;
				var label = document.createElement('label');
				label.className = 'togglebutton fullname';
				label.draggable = true;
				var input = document.createElement('input');
				input.type = 'radio';
				input.id = 'outfitting_module.' + stored.modid + '.' + namehash;
				input.name = 'module';
				input.value = stored.modid + '.' + namehash;
				var div = document.createElement('div');
				div.innerHTML = HTML_ICON['warning'] + HTML_ICON['engineer'] + encodeHTML(stored.name);
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
			if (input) {
				input.checked = true;
			}
			if (namehash) {
				current.pickerSlot.setStoredHash(current.stored.moduleNamehashStored[0][namehash].modulehash);
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
				var attrs = ['dps','sdps','eps','seps','hps','shps','maximumrng','ammoclip'];
				for (var i = 0;  i < 2;  i++) {
					var select = document.createElement('select');
					select.name = 'hardpoint_attr' + (i + 1);
					for (var a = 0;  a < attrs.length;  a++) {
						var option = document.createElement('option');
						option.value = attrs[a];
						option.text = (attrs[a] === 'maximumrng' ? 'Range' : (attrs[a] === 'ammoclip' ? 'Ammo' : attrs[a].toUpperCase()));
						select.appendChild(option);
					}
					select.selectedIndex = i * 6; // dps,maximumrng
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
		buildhash = window.location.protocol + '//' + window.location.hostname + window.location.pathname + '#/L=' + (buildhash || current.fit.getHash());
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
		var inaraURL = fit.getInaraURL();
		document.getElementById('fit_header_export').style.display = (inaraURL ? '' : 'none');
		document.forms.fit.elements.export_inara.style.display = (inaraURL ? '' : 'none');
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
		document.forms.stats.elements.stats_cur_fuel.value = formatNumText(fit.getStat('fuelcap'), 0);
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
			var stored = current.stored.shipNamehashStored[0][namehash];
			if (!stored)
				return false;
			current.hashlock = true;
			ok = setCurrentFitHash(stored.buildhash, namehash);
			current.hashlock = false;
			if (ok)
				updateUIFitHash(stored.buildhash);
		} else {
			var shipid = (current.fit ? current.fit.getShipID() : 1);
			ok = setCurrentFit(new Build(shipid, true), '');
		}
		return ok;
	}; // setCurrentFitNameHash()
	
	
	var processURLHash = function(location, hashlock) {
		var urlhash = location.hash;
		var msieURLtrunc = (location.href.length == 2083 || location.pathname.length == 2048);
		var blocks = urlhash.split('/');
		if (blocks[0] !== '#')
			return false;
		for (var b = 1;  b < blocks.length;  b++) {
			switch (blocks[b].slice(0,2)) {
			case 'L=':
				if (hashlock)
					current.hashlock = true;
				var ok = setCurrentFitHash(blocks[b].slice(2));
				if (hashlock)
					current.hashlock = false;
				if (ok)
					setUIPageTab('outfitting');
				return ok;
				
			case 'I=':
				return importData(blocks[b].slice(2), msieURLtrunc);
			}
		}
	}; // processURLHash()
	
	
	var readStoredOptions = function() {
		if (!cache.feature.storage)
			return false;
		
		try {
			var item = 'edsy_options' + (current.beta ? '_beta' : '');
			var data = JSON.parse(window.localStorage.getItem(item) || '{}');
			for (var opt in current.option) {
				if (data[opt] !== undefined)
					current.option[opt] = data[opt];
			}
		} catch (exc) {
			console.log(exc);
			return false;
		}
		return true;
	}; // readStoredOptions()
	
	
	var writeStoredOptions = function() {
		if (!cache.feature.storage)
			return false;
		
		var data = JSON.stringify(current.option);
		var item = 'edsy_options' + (current.beta ? '_beta' : '');
		window.localStorage.setItem(item, data);
		return true;
	}; // writeStoredOptions()
	
	
	var readStoredBuilds = function(overrideLive) {
		current.stored.shipNamehashStored = { 0:{} };
		current.stored.shipStoreds = { 0:[] };
		
		if (!cache.feature.storage)
			return false;
		
		var item = 'edsy_loadouts' + (current.beta ? '_beta' : '');
		var data = (window.localStorage.getItem(item) || '').split('/');
		if (current.beta && overrideLive) {
			data = data.concat((window.localStorage.getItem('edsy_loadouts') || '').split('/'));
		}
		for (var i = 0;  i < data.length;  i++) {
			var entry = data[i].split('=');
			if (entry.length === 2) {
				var namehash = entry[0];
				var buildhash = entry[1];
				var shipid = Build.getHashShipID(buildhash);
				var stored = {
					shipid:shipid,
					namehash:namehash,
					name:hashDecodeS(namehash),
					buildhash:buildhash
				};
				current.stored.shipNamehashStored[0][namehash] = stored;
			}
		}
		for (var namehash in current.stored.shipNamehashStored[0]) {
			var stored = current.stored.shipNamehashStored[0][namehash];
			if (!current.stored.shipNamehashStored[stored.shipid])
				current.stored.shipNamehashStored[stored.shipid] = {};
			current.stored.shipNamehashStored[stored.shipid][namehash] = stored;
		}
		for (var shipid in current.stored.shipNamehashStored) {
			current.stored.shipStoreds[shipid] = Object.values(current.stored.shipNamehashStored[shipid]);
			current.stored.shipStoreds[shipid].sort(sortStoreds);
		}
		
		return true;
	}; // readStoredBuilds()
	
	
	var writeStoredBuilds = function() {
		if (!cache.feature.storage)
			return false;
		
		var data = [];
		for (var namehash in current.stored.shipNamehashStored[0]) {
			data.push(namehash + '=' + current.stored.shipNamehashStored[0][namehash].buildhash);
		}
		var item = 'edsy_loadouts' + (current.beta ? '_beta' : '');
		window.localStorage.setItem(item, data.join('/'));
		return true;
	}; // writeStoredBuilds()
	
	
	var setStoredImport = function(importhash, namehash) {
		var namehashOld = current.importLabel[importhash];
		if (namehashOld) {
			delete current.labelImports[namehashOld][importhash];
			var empty = true;
			for (var importhashOld in current.labelImports[namehashOld]) {
				empty = false;
				break;
			}
			if (empty)
				delete current.labelImports[namehashOld];
		}
		current.importLabel[importhash] = namehash;
		if (!current.labelImports[namehash])
			current.labelImports[namehash] = {};
		current.labelImports[namehash][importhash] = true;
		return true;
	}; // setStoredImport()
	
	
	var readStoredImports = function() {
		current.importLabel = {};
		current.labelImports = {};
		
		if (!cache.feature.storage)
			return false;
		
		var item = 'edsy_imports' + (current.beta ? '_beta' : '');
		var data = (window.localStorage.getItem(item) || '').split('/');
		for (var i = 0;  i < data.length;  i++) {
			var entry = data[i].split('=');
			if (entry.length === 2) {
				var importhash = entry[0];
				var namehash = entry[1];
				// importhashes from 3.4.2.3 were corrupted by uppercasing; ignore them
				var tag = importhash.slice(0,3);
				if (tag !== tag.toUpperCase()) {
					setStoredImport(importhash, namehash);
				}
			}
		}
		return true;
	}; // readStoredImports()
	
	
	var writeStoredImports = function() {
		if (!cache.feature.storage)
			return false;
		
		var data = [];
		for (var importhash in current.importLabel) {
			data.push(importhash + '=' + current.importLabel[importhash]);
		}
		var item = 'edsy_imports' + (current.beta ? '_beta' : '');
		window.localStorage.setItem(item, data.join('/'));
		return true;
	}; // writeStoredImports()
	
	
	var updateUIFitStoredBuilds = function() {
		var select = document.forms.fit.elements.outfitting_fit_stored;
		var shipid = (current.fit ? current.fit.getShipID() : -1);
		return populateDOMSelectStoreds(select, current.stored.shipStoreds[shipid], select.value, 1);
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
		var storedbuild = (namehash && current.stored.shipNamehashStored[0][namehash]);
		document.getElementById('outfitting_fit_stored_reload').disabled = (setfit || !storedbuild);
		document.getElementById('outfitting_fit_stored_save').disabled = (setfit || !storedbuild);
		document.getElementById('outfitting_fit_stored_saveas').disabled = false;
		document.getElementById('outfitting_fit_stored_rename').disabled = (!storedbuild);
		document.getElementById('outfitting_fit_stored_delete').disabled = (!storedbuild);
		return true;
	}; // updateUIFitStoredBuildControls()
	
	
	var saveCurrentStoredBuild = function(saveas) {
		if (!current.fit)
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
			} while (!name || (current.stored.shipNamehashStored[0][namehash] && !confirm("A build labeled\n\n    "+name+"\n\nalready exists. Overwrite?")));
		}
		var buildhash = current.fit.getHash();
		var shipid = current.fit.getShipID();
		var stored = {
			shipid:shipid,
			namehash:namehash,
			name:hashDecodeS(namehash),
			buildhash:buildhash
		};
		if (!current.stored.shipNamehashStored[shipid])
			current.stored.shipNamehashStored[shipid] = {};
		current.stored.shipNamehashStored[0][namehash] = current.stored.shipNamehashStored[shipid][namehash] = stored;
		current.stored.shipStoreds[0] = Object.values(current.stored.shipNamehashStored[0]);
		current.stored.shipStoreds[0].sort(sortStoreds);
		current.stored.shipStoreds[shipid] = Object.values(current.stored.shipNamehashStored[shipid]);
		current.stored.shipStoreds[shipid].sort(sortStoreds);
		writeStoredBuilds();
		updateUIShipyardStoredBuild(namehash, current.fit);
		if (namehash !== oldnamehash) {
			updateUIFitStoredBuilds();
		}
		updateUIFitStoredBuildControls(true, namehash);
		updateUIAnalysisStoredBuilds();
	}; // saveCurrentStoredBuild()
	
	
	var renameStoredBuild = function(namehash) {
		var stored = current.stored.shipNamehashStored[0][namehash];
		if (!namehash || !stored)
			return false;
		var oldnamehash = namehash;
		var name = stored.name;
		do {
			name = prompt("Enter a new label for the stored build", name);
			if (name === null)
				return false;
			name = (name || '').trim();
			namehash = hashEncodeS(name);
			if (namehash === oldnamehash)
				return false;
		} while (!name || (current.stored.shipNamehashStored[0][namehash] && !confirm("A build labeled\n\n    "+name+"\n\nalready exists. Overwrite?")));
		stored.namehash = namehash;
		stored.name = name;
		current.stored.shipNamehashStored[0][namehash] = current.stored.shipNamehashStored[stored.shipid][namehash] = stored;
		delete current.stored.shipNamehashStored[0][oldnamehash];
		delete current.stored.shipNamehashStored[stored.shipid][oldnamehash];
		current.stored.shipStoreds[0] = Object.values(current.stored.shipNamehashStored[0]);
		current.stored.shipStoreds[0].sort(sortStoreds);
		current.stored.shipStoreds[stored.shipid] = Object.values(current.stored.shipNamehashStored[stored.shipid]);
		current.stored.shipStoreds[stored.shipid].sort(sortStoreds);
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
		updateUIAnalysisStoredBuilds(oldnamehash, namehash);
	}; // renameStoredBuild()
	
	
	var deleteStoredBuild = function(namehash) {
		var stored = current.stored.shipNamehashStored[0][namehash];
		if (!namehash || !stored)
			return false;
		var name = stored.name;
		if (!confirm("The stored build labeled\n\n    "+name+"\n\nwill be deleted. Are you sure?"))
			return false;
		delete current.stored.shipNamehashStored[0][namehash];
		delete current.stored.shipNamehashStored[stored.shipid][namehash];
		current.stored.shipStoreds[0] = Object.values(current.stored.shipNamehashStored[0]);
		current.stored.shipStoreds[0].sort(sortStoreds);
		current.stored.shipStoreds[stored.shipid] = Object.values(current.stored.shipNamehashStored[stored.shipid]);
		current.stored.shipStoreds[stored.shipid].sort(sortStoreds);
		stored = null;
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
		updateUIAnalysisStoredBuilds();
	}; // deleteStoredBuild()
	
	
	var updateUIFitShip = function() {
		var shipid = current.fit.getShipID();
		var ship = eddb.ship[shipid];
		
		// get attributes
		var slot = current.fit.getSlot('ship', 'hull');
		var crew = slot.getEffectiveAttrValue('crew');
		var mass = slot.getEffectiveAttrValue('mass');
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
				var namehashes = Object.keys(current.stored.moduleNamehashStored[modid] || EMPTY_OBJ);
				namehashes.push('');
				for (var n = 0;  n < namehashes.length;  n++) {
					var namehash = namehashes[n];
					if (namehash) {
						current.tempSlot.setStoredHash(current.stored.moduleNamehashStored[0][namehash].modulehash);
					} else {
						current.tempSlot.setModuleID(modid);
					}
					var notenough = false;
					var notallowed = false;
					switch (mtype) {
					case 'cpd':
						notenough = (current.tempSlot.getEffectiveAttrValue('engcap') < (boostcost + BOOST_MARGIN));
						break;
						
					case 'ct':
						notenough = (current.tempSlot.getEffectiveAttrValue('engmaxmass') < mass);
						break;
						
					case 'ifh':
					case 'ipc':
						var module = eddb.module[modid];
						notallowed = (module.reserved && !module.reserved[shipid]);
						break;
						
					case 'isg':
						notenough = (current.tempSlot.getEffectiveAttrValue('genmaxmass') < mass);
						break;
					}
					var el = document.getElementById('outfitting_module.' + modid + '.' + namehash);
					el.classList.toggle('notenough', notenough);
					el.classList.toggle('notallowed', notallowed);
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
	
	
	var updateUIFitDiscounts = function(discounts) {
		var slot;
		for (var slotgroup in GROUP_LABEL) {
			for (var slotnum = 0;  slot = current.fit.getSlot(slotgroup, slotnum);  slotnum++) {
				slot.setDiscounts(discounts);
			}
		}
		if (current.outfitting_focus === 'slot') {
			updateUIFitStoredBuildControls();
			updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		}
		updateUIDetailsStoredModuleControls();
		updateUIDetailsCost();
		return true;
	}; // updateUIFitDiscounts()
	
	
	var updateUIFitPowerDist = function() {
		var maxcrew = (current.fit.getSlot('ship', 'hull').getEffectiveAttrValue('crew') - 1);
		var crew = current.fit.getCrewDist();
		document.getElementById('outfitting_fit_crewdist_avl').className = ('crew' + (maxcrew - crew.sys - crew.eng - crew.wep) + ' max' + maxcrew);
		document.getElementById('outfitting_fit_crewdist_sys').className = ('crew' + crew.sys + ' max' + maxcrew);
		document.getElementById('outfitting_fit_crewdist_eng').className = ('crew' + crew.eng + ' max' + maxcrew);
		document.getElementById('outfitting_fit_crewdist_wep').className = ('crew' + crew.wep + ' max' + maxcrew);
		var dist = current.fit.getEffectivePowerDist();
		document.getElementById('outfitting_fit_powerdist_sys').className = ('crew' + crew.sys + ' dist' + dist.sys);
		document.getElementById('outfitting_fit_powerdist_eng').className = ('crew' + crew.eng + ' dist' + dist.eng);
		document.getElementById('outfitting_fit_powerdist_wep').className = ('crew' + crew.wep + ' dist' + dist.wep);
	}; // updateUIFitPowerDist()
	
	
	var emptyUIFitLimitedSlots = function(limit, slotgroup, slotnum) {
		var slot = current.fit.getSlot(slotgroup, slotnum);
		if (!limit)
			limit = slot ? (slot.getModule() || EMPTY_OBJ).limit : null;
		var limitSlots = current.fit.getLimitedSlots();
		if (eddb.limit[limit] && limitSlots[limit] && !current.option.experimental) {
			var limitmax = eddb.limit[limit] + (current.fit.getStat('unlimit')[limit] || 0);
			for (var s = limitSlots[limit].length - 1;  s >= 0 && limitSlots[limit].length > limitmax;  s--) {
				var slotlim = limitSlots[limit][s];
				if (slotlim.getSlotGroup() != slotgroup || slotlim.getSlotNum() != slotnum) {
					if (slotlim.setModuleID(0)) {
						updateUIFitSlot(slotlim.getSlotGroup(), slotlim.getSlotNum());
						limitSlots[limit].splice(s, 1);
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
				var limitmax = (eddb.limit[limit] || 99) + (current.fit.getStat('unlimit')[limit] || 0);
				document.getElementById('outfitting_fit_module_' + slotgroup + '_' + slotnum).classList.toggle('overlimit', (limitSlots[limit] || EMPTY_ARR).length > limitmax);
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
		
		document.getElementById('outfitting_fit_power_' + group_slot).className = 'priority' + slot.getPriority() + (slot.getPowerLock() ? ' powerlock' : '');
		var value = slot.getEffectiveAttrValue('pwrdraw') || 0;
		var direction = getAttrModifierDirection('pwrdraw', slot.getEffectiveAttrModifier('pwrdraw'));
		if (value) {
			document.getElementById('outfitting_fit_pwrdraw_' + group_slot).innerHTML = ('-' + formatAttrHTML('pwrdraw', value));
			document.getElementById('outfitting_fit_powered_' + group_slot).disabled = !!slot.getPowerLock();
			document.getElementById('outfitting_fit_powered_' + group_slot).checked = slot.getPowered();
			document.getElementById('outfitting_fit_priority_' + group_slot).disabled = !!slot.getPowerLock();
			document.getElementById('outfitting_fit_priority_' + group_slot).innerHTML = slot.getPriority();
		} else {
			var value = slot.getEffectiveAttrValue('pwrcap') || 0;
			var direction = getAttrModifierDirection('pwrcap', slot.getEffectiveAttrModifier('pwrcap'));
			document.getElementById('outfitting_fit_powered_' + group_slot).disabled = true;
			document.getElementById('outfitting_fit_pwrdraw_' + group_slot).innerHTML = (value ? ('+' + formatAttrHTML('pwrcap', value)) : '');
			document.getElementById('outfitting_fit_priority_' + group_slot).disabled = true;
			document.getElementById('outfitting_fit_priority_' + group_slot).innerHTML = '';
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
				if (slotgroup === 'hardpoint') {
					attr = 'eps';
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
				if (slotgroup === 'hardpoint') {
					attr = 'hps';
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
				
			case 'maximumrng':
				if (hardpoint_attrs['maximumrng']) {
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
				var value = slot.getEffectiveAttrValue(attr) * slot.getEffectiveAttrValue('scbdur');
				var value2 = slot.getBaseAttrValue(attr) * slot.getBaseAttrValue('scbdur');
				var direction = value - value2;
				if (value) {
					attrhtml.push(formatAttrLabelHTML(attr, null, 'Total shield recharge') + ' <span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' + formatNumHTML(value, 0) + '</span>');
				}
				attr = null;
				break;
				
			case 'thmdrain':
				var value = slot.getEffectiveAttrValue(attr) * slot.getEffectiveAttrValue('hsdur');
				var value2 = slot.getBaseAttrValue(attr) * slot.getBaseAttrValue('hsdur');
				var direction = value - value2;
				if (value) {
					attrhtml.push(formatAttrLabelHTML(attr, null, 'Total thermal drain') + ' <span class="' + (direction > 0 ? 'modgood' : (direction < 0 ? 'modbad' : '')) + '">' + formatNumHTML(value, 0) + '</span>');
				}
				attr = null;
				break;
				
			case 'afmrepcap':
			case 'lmprepcap':
				var value = slot.getEffectiveAttrValue(attr) * slot.getEffectiveAttrValue('repairrtg');
				var value2 = slot.getBaseAttrValue(attr) * slot.getBaseAttrValue('repairrtg');
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
		var value = slot.getCost();
		var base = slot.getBaseCost();
		var direction = base - value;
		el.innerHTML = ((base !== undefined) ? formatPriceHTML(value) : '');
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
			var namehash = '';
			var modulehash = slot.getStoredHash();
			for (var nh in (current.stored.moduleNamehashStored[modid] || EMPTY_OBJ)) {
				if (current.stored.moduleNamehashStored[modid][nh].modulehash === modulehash) {
					namehash = nh;
					break;
				}
			}
			setUIPickerModule(modid, namehash, modid && (current.tab === 'SLOT'));
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
		var module = slot.getModule();
		var limitOld = (module || EMPTY_OBJ).limit;
		var unlimitOld = (module || EMPTY_OBJ).unlimit;
		var ok;
		if (namehash || storedhash) {
			ok = slot.setStoredHash(storedhash || current.stored.moduleNamehashStored[0][namehash].modulehash, null, current.option.experimental);
			modid = slot.getModuleID();
		} else {
			ok = slot.setModuleID(modid, current.option.experimental);
			if (ok)
				slot.setDiscounts(current.option.discounts);
		}
		if (!ok)
			return false;
		module = slot.getModule();
		var limitNew = (module || EMPTY_OBJ).limit;
		var unlimitNew = (module || EMPTY_OBJ).unlimit;
		updateUIFitStoredBuildControls();
		updateUIFitSlot(slotgroup, slotnum);
		if (eddb.limit[limitNew]) {
			emptyUIFitLimitedSlots(limitNew, slotgroup, slotnum);
		}
		if (eddb.limit[unlimitOld]) {
			emptyUIFitLimitedSlots(unlimitOld);
		}
		if (eddb.limit[limitOld] || eddb.limit[unlimitNew]) {
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
		var module1 = current.fit.getSlot(slotgroup2, slotnum2).getModule();
		var limitOld = (module1 || EMPTY_OBJ).limit;
		var unlimitOld = (module1 || EMPTY_OBJ).unlimit;
		if (!current.fit.copySlot(slotgroup1, slotnum1, slotgroup2, slotnum2))
			return false;
		var module2 = current.fit.getSlot(slotgroup2, slotnum2).getModule();
		var limitNew = (module2 || EMPTY_OBJ).limit;
		var unlimitNew = (module2 || EMPTY_OBJ).unlimit;
		updateUIFitStoredBuildControls();
		updateUIFitSlot(slotgroup2, slotnum2);
		if (eddb.limit[limitNew]) {
			emptyUIFitLimitedSlots(limitNew, slotgroup2, slotnum2);
		}
		if (eddb.limit[unlimitOld]) {
			emptyUIFitLimitedSlots(unlimitOld);
		}
		if (eddb.limit[limitOld] || eddb.limit[unlimitNew]) {
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
		var container = document.getElementById('details_cost_discounts');
		while (container.lastElementChild)
			cache.template.details_cost_discounts_label = container.removeChild(container.lastElementChild);
		for (var i = 0;  i <= DISCOUNTS.length;  i++) {
			var bit = min(1 << i, 0x3F);
			var label = cache.template.details_cost_discounts_label.cloneNode(true);
			label.getElementsByTagName('INPUT')[0].value = bit;
			label.getElementsByTagName('DIV')[0].innerHTML = (bit == 0x3F) ? 'FREE' : formatPctHTML(1 - cache.discountMod[bit], (DISCOUNTS[DISCOUNTS.length - 1 - i] % 1 ? 1 : 0));
			container.appendChild(label);
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
		current.stored.moduleNamehashStored = { 0:{} };
		current.stored.moduleStoreds = { 0:[] };
		
		if (!cache.feature.storage)
			return false;
		
		// populate builtin stored modules (which are specially named with leading spaces)
		if (current.option.builtin !== 'none') {
			for (var bmodid in BUILTIN_STORED_MODULES) {
				var builtin = BUILTIN_STORED_MODULES[bmodid];
				if (current.option.builtin === 'all' || builtin.available || current.option['builtin'+bmodid]) {
					var name = " "+builtin.name;
					var namehash = hashEncodeS(name);
					var stored = {
						modid:Slot.getStoredHashModuleID(builtin.modulehash),
						namehash:namehash,
						name:name,
						modulehash:builtin.modulehash
					};
					current.stored.moduleNamehashStored[0][namehash] = stored;
				}
			}
		}
		
		// load regular stored modules
		var item = 'edsy_modules' + (current.beta ? '_beta' : '');
		var data = (window.localStorage.getItem(item) || '').split('/');
		for (var i = 0;  i < data.length;  i++) {
			var entry = data[i].split('=');
			if (entry.length === 2) {
				var namehash = entry[0];
				var modulehash = entry[1];
				var modid = Slot.getStoredHashModuleID(modulehash);
				var stored = {
					modid:modid,
					namehash:namehash,
					name:hashDecodeS(namehash),
					modulehash:modulehash
				};
				current.stored.moduleNamehashStored[0][namehash] = stored;
			}
		}
		
		for (var namehash in current.stored.moduleNamehashStored[0]) {
			var stored = current.stored.moduleNamehashStored[0][namehash];
			if (!current.stored.moduleNamehashStored[stored.modid])
				current.stored.moduleNamehashStored[stored.modid] = {};
			current.stored.moduleNamehashStored[stored.modid][namehash] = stored;
		}
		for (var modid in current.stored.moduleNamehashStored) {
			current.stored.moduleStoreds[modid] = Object.values(current.stored.moduleNamehashStored[modid]);
			current.stored.moduleStoreds[modid].sort(sortStoreds);
		}
		
		return true;
	}; // readStoredModules()
	
	
	var writeStoredModules = function() {
		if (!cache.feature.storage)
			return false;
		
		var data = [];
		for (var namehash in current.stored.moduleNamehashStored[0]) {
			// skip builtins
			if (!hashDecodeS(namehash).startsWith(" "))
				data.push(namehash + '=' + current.stored.moduleNamehashStored[0][namehash].modulehash);
		}
		var item = 'edsy_modules' + (current.beta ? '_beta' : '');
		window.localStorage.setItem(item, data.join('/'));
		return true;
	}; // writeStoredModules()
	
	
	var updateUIDetailsStoredModules = function() {
		var select = document.forms.details.elements.outfitting_details_stored;
		
		if (current.outfitting_focus === 'module') {
			var tokens = document.forms.modules.elements.module.value.split('.');
			var namehash = tokens[1];
			if (namehash) {
				setDOMSelectLength(select, 2);
				select.options[1].value = namehash;
				select.options[1].text = hashDecodeS(namehash);
				select.selectedIndex = 1;
			} else {
				setDOMSelectLength(select, 1);
				select.selectedIndex = 0;
			}
		} else if (current.outfitting_focus === 'slot') {
			var slot = current.fit.getSlot(current.group, current.slot);
			var modid = slot.getModuleID();
			if (current.group === 'ship') {
				setDOMSelectLength(select, 1);
				select.selectedIndex = 0;
			} else if (modid) {
				var namehash = select.value;
				select.selectedIndex = ((slot.getStoredHash() === cache.moduleHash[modid]) ? 0 : -1);
				populateDOMSelectStoreds(select, current.stored.moduleStoreds[modid], namehash, 1);
			}
		} else {
			return false;
		}
		
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
		if (setmodule) {
			if (!namehash && modid && modulehash !== stockhash) {
				for (var nh in (current.stored.moduleNamehashStored[modid] || EMPTY_OBJ)) {
					if (current.stored.moduleNamehashStored[modid][nh].modulehash === modulehash) {
						namehash = nh;
						break;
					}
				}
			}
			select.value = namehash || '';
		}
		if (select.selectedIndex <= 0) {
			select.selectedIndex = ((modid && modulehash === stockhash) ? 0 : -1);
		}
		namehash = select.value || '';
		var storedhash = (namehash ? current.stored.moduleNamehashStored[0][namehash].modulehash : stockhash);
		var builtin = hashDecodeS(namehash).startsWith(" ");
		
		select.disabled = (current.outfitting_focus === 'module' || current.group === 'ship' || !modid);
		document.getElementById('outfitting_details_stored_reload').disabled = (!namehash || modulehash === storedhash);
		document.getElementById('outfitting_details_stored_save').disabled = (!namehash || modulehash === storedhash || builtin)
		document.getElementById('outfitting_details_stored_saveas').disabled = (!modulehash || (current.outfitting_focus === 'slot' && current.group === 'ship'));
		document.getElementById('outfitting_details_stored_rename').disabled = (!namehash || builtin);
		document.getElementById('outfitting_details_stored_delete').disabled = (!namehash || builtin);
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
			} while (!name || (current.stored.moduleNamehashStored[0][namehash] && !confirm("A module labeled\n\n    "+name+"\n\nalready exists. Overwrite?")));
		}
		var stored = {
			modid:modid,
			namehash:namehash,
			name:hashDecodeS(namehash),
			modulehash:modulehash
		};
		if (stored.name.startsWith(" ")) {
			alert("Cannot overwrite a builtin module");
			return false;
		}
		if (!current.stored.moduleNamehashStored[modid])
			current.stored.moduleNamehashStored[modid] = {};
		current.stored.moduleNamehashStored[0][namehash] = current.stored.moduleNamehashStored[modid][namehash] = stored;
		current.stored.moduleStoreds[0] = Object.values(current.stored.moduleNamehashStored[0]);
		current.stored.moduleStoreds[0].sort(sortStoreds);
		current.stored.moduleStoreds[modid] = Object.values(current.stored.moduleNamehashStored[modid]);
		current.stored.moduleStoreds[modid].sort(sortStoreds);
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
		var stored = current.stored.moduleNamehashStored[0][namehash];
		if (!namehash || !stored || stored.name.startsWith(" "))
			return false;
		var oldnamehash = namehash;
		var name = stored.name;
		do {
			name = prompt("Enter a new label for the stored module", name);
			if (name === null)
				return false;
			name = (name || '').trim();
			namehash = hashEncodeS(name);
			if (namehash === oldnamehash)
				return false;
		} while (!name || (current.stored.moduleNamehashStored[0][namehash] && !confirm("A module labeled\n\n    "+name+"\n\nalready exists. Overwrite?")));
		stored.namehash = namehash;
		stored.name = name;
		current.stored.moduleNamehashStored[0][namehash] = current.stored.moduleNamehashStored[stored.modid][namehash] = stored;
		delete current.stored.moduleNamehashStored[0][oldnamehash];
		delete current.stored.moduleNamehashStored[stored.modid][oldnamehash];
		current.stored.moduleStoreds[0] = Object.values(current.stored.moduleNamehashStored[0]);
		current.stored.moduleStoreds[0].sort(sortStoreds);
		current.stored.moduleStoreds[stored.modid] = Object.values(current.stored.moduleNamehashStored[stored.modid]);
		current.stored.moduleStoreds[stored.modid].sort(sortStoreds);
		writeStoredModules();
		updateUIModulePickerStoredModules();
		var select = document.forms.details.elements.outfitting_details_stored;
		if (select.value === oldnamehash) {
			if (current.outfitting_focus === 'module') {
				setUIPickerModule(stored.modid, namehash, true);
			}
			updateUIDetailsStoredModules();
			select.value = namehash;
		} else {
			updateUIDetailsStoredModules();
		}
	}; // renameStoredModule()
	
	
	var deleteStoredModule = function(namehash) {
		var stored = current.stored.moduleNamehashStored[0][namehash];
		if (!namehash || !stored || stored.name.startsWith(" "))
			return false;
		var name = stored.name;
		if (!confirm("The stored module labeled\n\n    "+name+"\n\nwill be deleted. Are you sure?"))
			return false;
		delete current.stored.moduleNamehashStored[0][namehash];
		delete current.stored.moduleNamehashStored[stored.modid][namehash];
		current.stored.moduleStoreds[0] = Object.values(current.stored.moduleNamehashStored[0]);
		current.stored.moduleStoreds[0].sort(sortStoreds);
		current.stored.moduleStoreds[stored.modid] = Object.values(current.stored.moduleNamehashStored[stored.modid]);
		current.stored.moduleStoreds[stored.modid].sort(sortStoreds);
		stored = null;
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
			ok = slot.setStoredHash(current.stored.moduleNamehashStored[0][namehash].modulehash);
		} else {
			var modid = slot.getModuleID();
			ok = slot.setModuleID(modid);
			if (ok)
				slot.setDiscounts(current.option.discounts);
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
		
		// set displayed label
		var label = (module ? (module.mtype ? getModuleLabel(module, false, true) : module.name) : ((current.outfitting_focus === 'slot') ? '(Empty Slot)' : '(No Module)'));
		document.getElementById('outfitting_details_label').innerHTML = label;
		document.getElementById('details_rank').innerHTML = ((module && (module.rank > 0)) ? ((module.faction || 'unknown') + ' rank ' + module.rank + ' (' + eddb.rank[module.faction][module.rank] + ')') : '');
		
		// show or hide sections
		document.getElementById('details_cost').style.display = (module ? 'block' : 'none');
		document.getElementById('details_engineering').style.display = ((module && slot.isModifiable()) ? 'block' : 'none');
		document.getElementById('outfitting_details_table').style.display = (module ? '' : 'none');
		
		if (!module)
			return true;
		
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
			var attribute = cache.attribute[attr];
			
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
		
		// set displayed cost and modification data
		updateUIDetailsCost();
		updateUIDetailsModifications();
		return true;
	}; // updateUIDetailsModule()
	
	
	var updateUIDetailsCost = function() {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		var cost = slot.getCost();
		var base = slot.getBaseCost();
		var actual = slot.hasActualCost();
		var discounts = slot.getDiscounts();
		var disabled = (base < 1);
		var el = document.forms.details.elements.cost;
		el.value = formatNumText(cost, 0);
		el.size = max(cost, base).toString().length + 1;
		el.disabled = disabled;
		el = document.getElementById('details_cost_mod');
		el.innerHTML = ((base < 0 || base == cost) ? '' : formatPctHTML(cost / base - 1, 1));
		el.className = ((cost < base) ? 'modgood' : ((cost > base) ? 'modbad' : ''));
		el = document.getElementById('details_cost_label');
		var inputs = document.getElementById('details_cost').getElementsByTagName('INPUT');
		for (var i = 0;  i < inputs.length;  i++) {
			if (inputs[i].name === 'discount') {
				var bit = parseInt(inputs[i].value);
				inputs[i].checked = (bit ? (((discounts & bit) == bit) && ((discounts == 0x3F) == (bit == 0x3F))) : actual);
				inputs[i].disabled = disabled;
			}
		}
		return true;
	}; // updateUIDetailsCost()
	
	
	var setUIDetailsCost = function(cost) {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		if (!slot.setCost(cost))
			return false;
		if (current.outfitting_focus === 'slot') {
			updateUIFitStoredBuildControls();
			updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		}
		updateUIDetailsStoredModuleControls();
		updateUIDetailsCost();
		return true;
	}; // setUIDetailsCost()
	
	
	var setUIDetailsDiscounts = function(discounts) {
		var slot = getUIOutfittingSlot();
		if (!slot)
			return false;
		if (!slot.setDiscounts(discounts))
			return false;
		if (current.outfitting_focus === 'slot') {
			updateUIFitStoredBuildControls();
			updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		}
		updateUIDetailsStoredModuleControls();
		updateUIDetailsCost();
		return true;
	}; // setUIDetailsDiscounts()
	
	
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
		document.getElementById('details_special').innerHTML = ((eddb.expeffect[expid] || EMPTY_OBJ).special || '');
		
		var maxgrade = (bpid ? eddb.blueprint[bpid].maxgrade : 0);
		for (var g = 1;  g <= MAX_BLUEPRINT_GRADE;  g++) {
			document.getElementById('blueprint_grade_' + g).disabled = (g > maxgrade);
		}
		document.forms.details.elements.blueprint_grade.value = bpgrade.toFixed(0);
		
		updateUIDetailsBlueprintRoll((bpid || modified) ? bproll : null);
		
		var module = slot.getModule();
		if (module) {
			var input;
			for (var r = 0;  (input = document.getElementById('outfitting_details_input_' + r)) && cache.attribute[input.name];  r++) {
				var attr = input.name;
				var override = slot.isAttrOverridden(attr);
				var modifier = slot.getEffectiveAttrModifier(attr);
				var direction = getAttrModifierDirection(attr, modifier);
				var value = slot.getEffectiveAttrValue(attr);
				input.value = getModuleAttrValueText(module, attr, value);
				input.size = max(input.value.length, 3);
				input.disabled = !((modifiable && isModuleAttrModifiable(module, attr) && (bpid || current.option.experimental)) || slot.getBaseAttrModifier(attr));
				var moddisplay = document.getElementById('outfitting_details_mod_' + r);
				moddisplay.className = (direction ? ((direction < 0) ? 'modbad' : 'modgood') : '') + (override ? ' modoverride' : '');
				moddisplay.innerHTML = getModuleAttrModifierHTML(module, attr, modifier);
			}
		}
		return true;
	}; // updateUIDetailsModifications()
	
	
	var updateUIDetailsBlueprintRoll = function(bproll) {
		if (bproll === undefined) {
			var slot = getUIOutfittingSlot();
			if (!slot)
				return false;
			bproll = (slot.getBlueprintID() || slot.isModified()) ? slot.getBlueprintRoll() : null;
		}
		var className, disabled, value;
		if (bproll === null) {
			className = 'disabled';
			disabled = true;
			value = '';
		} else if (bproll <= 0) {
			className = 'invalid';
			disabled = false;
			value = 'N/A';
		} else {
			className = '';
			disabled = false;
			value = formatPctText(bproll, 1);
			document.getElementById('roll_ring1').style.transform = ('rotate(' + (min(max(bproll / 0.5    , 0), 1) * 180).toFixed(0) + 'deg)');
			document.getElementById('roll_ring2').style.transform = ('rotate(' + (min(max(bproll / 0.5 - 1, 0), 1) * 180).toFixed(0) + 'deg)');
		}
		document.getElementById('engineering_roll').className = className;
		document.forms.details.elements.blueprint_roll.disabled = disabled;
		document.forms.details.elements.blueprint_roll.value = value;
		document.forms.details.elements.blueprint_roll_preset1.disabled = disabled;
		document.forms.details.elements.blueprint_roll_preset2.disabled = disabled;
		document.forms.details.elements.blueprint_roll_preset3.disabled = disabled;
	}; // updateUIDetailsBlueprintRoll()
	
	
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
		var attribute = cache.attribute[attr];
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
				var modifier = getModuleAttrModifier(module, attr, parseNumText(text));
			}
			if (!slot.setEffectiveAttrModifier(attr, modifier))
				return false;
		}
		if (slot.getBlueprintRoll())
			slot.setBlueprintRoll(0);
		if (current.outfitting_focus === 'slot') {
			updateUIFitStoredBuildControls();
			updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		}
		updateUIDetailsStoredModuleControls();
		updateUIDetailsModifications();
		return true;
	}; // setUIDetailsAttrText()
	
	
	/*
	* STATS UI
	*/
	
	
	var setStatsCurFuel = function(value) {
		value = min(max(value, 0), current.fit.getStat('fuelcap'));
		document.forms.stats.elements.stats_cur_fuel.value = formatNumText(value, (value % 1) ? 1 : 0);
		updateUIStats();
	}; // setStatsCurFuel()
	
	
	var setStatsCurCargo = function(value) {
		value = min(max((value + 0.5) | 0, 0), current.fit.getStat('cargocap'));
		document.forms.stats.elements.stats_cur_cargo.value = formatNumText(value, 0);
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
		if (current.option.hidestats && space < 0) {
			panels.sort(function(p1,p2) { return panelOrder[p2] - panelOrder[p1]; });
			while (space < 0 && panels.length > 1) {
				var p = panels.pop();
				document.getElementById('stats_toggle_' + p).checked = false;
				space += panelWidth[p];
			}
		}
	}; // updateUIStatsPanels()
	
	
	var updateUIStats = function() {
		// mark undersized fitted power plant
		var pwrdraw_ret = current.fit.getStat('pwrdraw_ret');
		var pwrbst = current.fit.getStat('pwrbst') / 100.0;
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.PP);
		document.getElementById('outfitting_fit_module_component_' + CORE_ABBR_SLOT.PP).classList.toggle('notenough', (slot.getEffectiveAttrValue('pwrcap') * (1 + pwrbst)) < pwrdraw_ret[0]);
		
		// mark undersized fitted thruster
		var massBase = current.fit.getStat('mass') + current.fit.getStat('fuelcap') + current.fit.getStat('cargocap');
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.TH);
		document.getElementById('outfitting_fit_module_component_' + CORE_ABBR_SLOT.TH).classList.toggle('notenough', slot.getEffectiveAttrValue('engmaxmass') < massBase);
		document.getElementById('outfitting_stats_max_mass').classList.toggle('error', slot.getEffectiveAttrValue('engmaxmass') < massBase);
		massBase -= slot.getEffectiveAttrValue('mass');
		
		// mark undersized power plant and thruster options
		for (var mtype in { cpp:1, ct:1 }) {
			for (var m = 0;  m < cache.mtypeModules[mtype].length;  m++) {
				var modid = cache.mtypeModules[mtype][m];
				var namehashes = Object.keys(current.stored.moduleNamehashStored[modid] || EMPTY_OBJ);
				namehashes.push('');
				for (var n = 0;  n < namehashes.length;  n++) {
					var namehash = namehashes[n];
					if (namehash) {
						current.tempSlot.setStoredHash(current.stored.moduleNamehashStored[0][namehash].modulehash);
					} else {
						current.tempSlot.setModuleID(modid);
					}
					var notenough = false;
					switch (mtype) {
					case 'ct':
						notenough = (current.tempSlot.getEffectiveAttrValue('engmaxmass') < (massBase + current.tempSlot.getEffectiveAttrValue('mass')));
						break;
						
					case 'cpp':
						notenough = ((current.tempSlot.getEffectiveAttrValue('pwrcap') * (1 + pwrbst)) < pwrdraw_ret[0]);
						break;
					}
					document.getElementById('outfitting_module.' + modid + '.' + namehash).classList.toggle('notenough', notenough);
				}
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
		var rebuy = 1 - (parseFloat(current.option.insurance) / 10000.0);
		var fuelres = eddb.ship[current.fit.getShipID()].fuelreserve;
		var cost = current.fit.getStat('cost');
		var mass = current.fit.getStat('mass');
		var fuelcap = current.fit.getStat('fuelcap');
		var cargocap = current.fit.getStat('cargocap');
		var cabincap = current.fit.getStat('cabincap');
		
		// compute derived stats
		var curTtlFuel = min(max(parseNumText(document.forms.stats.elements.stats_cur_fuel.value) || 0, 0), fuelcap) + fuelres;
		var curTtlCrgo = min(max(parseNumText(document.forms.stats.elements.stats_cur_cargo.value) || 0, 0), cargocap);
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
		var cost_rebuy = cost * rebuy;
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
		var pwrbst = current.fit.getStat('pwrbst') / 100.0;
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
			abbr.className = ((pwrdraw_ret_ttl <= MAX_MALFUNCTION_PWRCAP * (1 + pwrbst) * pwrcap) ? 'mfn' : ((pwrdraw_ret_ttl <= MAX_DAMAGED_PWRCAP * (1 + pwrbst) * pwrcap) ? 'dmg' : ((pwrdraw_ret_ttl <= (1 + pwrbst) * pwrcap) ? '' : 'err')));
			
			pwrdraw_dep_ttl += pwrdraw_dep[p];
			var width = (90.0 * pwrdraw_dep[p] / pwrcap);
			var abbr = document.getElementById('outfitting_stats_power_dep_' + p);
			abbr.title = (formatNumText(pwrdraw_dep_ttl, 2) + ' / ' + formatNumText(pwrcap, 2) + ' MW (' + formatPctText(pwrdraw_dep_ttl / pwrcap, 1) + ')');
			abbr.style.display = (width > 0.0) ? '' : 'none';
			abbr.style.width = width.toFixed(3) + '%';
			abbr.className = ((pwrdraw_dep_ttl <= MAX_MALFUNCTION_PWRCAP * (1 + pwrbst) * pwrcap) ? 'mfn' : ((pwrdraw_dep_ttl <= MAX_DAMAGED_PWRCAP * (1 + pwrbst) * pwrcap) ? 'dmg' : ((pwrdraw_dep_ttl <= (1 + pwrbst) * pwrcap) ? '' : 'err')));
			
			if (pwrdraw_ret_ttl > (1 + pwrbst) * pwrcap) {
				classes += ' priority' + p + 'err';
			} else if (pwrdraw_dep_ttl > (1 + pwrbst) * pwrcap) {
				classes += ' priority' + p + 'wrn';
			} else if (pwrdraw_ret_ttl <= MAX_MALFUNCTION_PWRCAP * (1 + pwrbst) * pwrcap) {
				classes += ' priority' + p + 'mfn';
			} else if (pwrdraw_ret_ttl <= MAX_DAMAGED_PWRCAP * (1 + pwrbst) * pwrcap) {
				classes += ' priority' + p + 'dmg';
			}
		}
		document.getElementById('outfitting_fit_slots').className = classes.substring(1);
		/* TODO: powerdist in fit
		document.getElementById('outfitting_stats_power_ret').innerHTML = (formatNumHTML(pwrdraw_ret[0], 2) + ' <small class="semantic">/</small> ' + formatAttrHTML('pwrcap', pwrcap, 2) + ' (' + formatPctHTML(pwrdraw_ret[0] / pwrcap, 1) + ')');
		document.getElementById('outfitting_stats_power_ret').className = ((pwrdraw_ret[0] > (1 + pwrbst) * pwrcap) ? 'error' : '');
		document.getElementById('outfitting_stats_power_dep').innerHTML = (formatNumHTML(pwrdraw_dep[0], 2) + ' <small class="semantic">/</small> ' + formatAttrHTML('pwrcap', pwrcap, 2) + ' (' + formatPctHTML(pwrdraw_dep[0] / pwrcap, 1) + ')');
		document.getElementById('outfitting_stats_power_dep').className = ((pwrdraw_dep[0] > (1 + pwrbst) * pwrcap) ? 'error' : '');
		*/
		document.getElementById('outfitting_stats_power_ret').innerHTML = ('<abbr class="' + ((pwrdraw_ret[0] > (1 + pwrbst) * pwrcap) ? 'error' : '') + '" title="' + formatNumText(pwrdraw_ret[0], 2) + ' / ' + formatNumText(pwrcap, 2) + ' MW">' + formatPctHTML(pwrdraw_ret[0] / pwrcap, 1) + '</abbr>');
		document.getElementById('outfitting_stats_power_dep').innerHTML = ('<abbr class="' + ((pwrdraw_dep[0] > (1 + pwrbst) * pwrcap) ? 'error' : '') + '" title="' + formatNumText(pwrdraw_dep[0], 2) + ' / ' + formatNumText(pwrcap, 2) + ' MW">' + formatPctHTML(pwrdraw_dep[0] / pwrcap, 1) + '</abbr>');
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
		var optmass = slot.getEffectiveAttrValue('fsdoptmass');
		var maxfuel = slot.getEffectiveAttrValue('maxfuel');
		var fuelmul = slot.getEffectiveAttrValue('fuelmul');
		var fuelpower = slot.getEffectiveAttrValue('fuelpower');
		
		// get or compute derived stats
		var curTtlFuel = min(max(parseNumText(document.forms.stats.elements.stats_cur_fuel.value) || 0, 0), fuelcap);
		var curTtlCrgo = min(max(parseNumText(document.forms.stats.elements.stats_cur_cargo.value) || 0, 0), cargocap);
		var ldnNavJmp = current.fit.getStat('_jump_laden');
		var unlNavJmp = current.fit.getStat('_jump_unladen');
		var curNavJmp = getJumpDistance(         mass + curTtlFuel + fuelres + curTtlCrgo, min(curTtlFuel, maxfuel), optmass, fuelmul, fuelpower, jumpbst);
		var maxNavJmp = current.fit.getStat('_jump_max');
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
		var minmass = slot.getEffectiveAttrValue('engminmass');
		var optmass = slot.getEffectiveAttrValue('engoptmass');
		var maxmass = slot.getEffectiveAttrValue('engmaxmass');
		var minmulspd = slot.getEffectiveAttrValue('minmulspd');
		var optmulspd = slot.getEffectiveAttrValue('optmulspd');
		var maxmulspd = slot.getEffectiveAttrValue('maxmulspd');
		var minmulrot = slot.getEffectiveAttrValue('minmulrot');
		var optmulrot = slot.getEffectiveAttrValue('optmulrot');
		var maxmulrot = slot.getEffectiveAttrValue('maxmulrot');
		
		// compute derived stats
		var curTtlFuel = min(max(parseNumText(document.forms.stats.elements.stats_cur_fuel.value) || 0, 0), fuelcap) + fuelres;
		var curTtlCrgo = min(max(parseNumText(document.forms.stats.elements.stats_cur_cargo.value) || 0, 0), cargocap);
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
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.PD);
		var syscap = slot.getEffectiveAttrValue('syscap');
		var syschg = slot.getEffectiveAttrValue('syschg');
		for (var slotnum = 0;  slot = current.fit.getSlot('internal', slotnum);  slotnum++) {
			if ((slot.getModule() || EMPTY_OBJ).mtype === 'isg' && slot.getPowered())
				break;
		}
		var maxmass = slot ? slot.getEffectiveAttrValue('genmaxmass') : 0;
		var bgenrate = slot ? slot.getEffectiveAttrValue('bgenrate') : 0;
		var genrate = slot ? slot.getEffectiveAttrValue('genrate') : 0;
		var distdraw_mj = slot ? slot.getEffectiveAttrValue('genpwr') : 0;
		
		// get or compute derived stats
		var hasSG = !!slot;
		var isEnough = (maxmass >= mass_hull);
		var absShdRes = getPipDamageResistance(powerdist_sys) / 100;
		var kinShdRes = current.fit.getStat('_skinres') / 100;
		var thmShdRes = current.fit.getStat('_sthmres') / 100;
		var expShdRes = current.fit.getStat('_sexpres') / 100;
		var cauShdRes = current.fit.getStat('_scaures') / 100;
		var rawShdStr = current.fit.getStat('_shields');
		var ammomaxText = formatNumText(shieldrnfps_ammomax / shieldrnfps, (shieldrnfps_ammomax % shieldrnfps) ? 1 : 0);
		var powerdistSysMul = pow(powerdist_sys / MAX_POWER_DIST, 1.1);
		var bgenFastTime = min((rawShdStr / 2 / bgenrate), (syscap / max(0, bgenrate * distdraw_mj - syschg * powerdistSysMul)));
		var bgenSlowTime = (rawShdStr / 2 - bgenrate * bgenFastTime) / min(bgenrate, (syschg * powerdistSysMul) / distdraw_mj);
		// TODO: does it really make sense to assume a full cap to start regen from 50-100%?
		//var genFastTime = min((rawShdStr / 2 / genrate), (syscap / max(0, genrate * distdraw_mj - syschg * powerdistSysMul)));
		//var genSlowTime = (rawShdStr / 2 - genrate * genFastTime) / min(genrate, (syschg * powerdistSysMul) / distdraw_mj);
		var genFastTime = 0;
		var genSlowTime = (rawShdStr / 2) / min(genrate, (syschg * powerdistSysMul) / distdraw_mj);
		
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
		document.getElementById('outfitting_stats_shield_build').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatTimeHTML(16 + bgenFastTime + bgenSlowTime)));
		document.getElementById('outfitting_stats_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatTimeHTML(genFastTime + genSlowTime)));
	}; // updateUIStatsShd();
	
	
	var updateUIStatsArm = function() {
		// get primary stats
		var integ_imrp = current.fit.getStat('integ_imrp');
		var dmgprot = current.fit.getStat('dmgprot');
		var lmprepcap_max = current.fit.getStat('lmprepcap_max');
		var cargocap = current.fit.getStat('cargocap');
		
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
		var rawArmRep = lmprepcap_max * cargocap;
		var kinArmRep = (rawArmRep / (1 - kinArmRes / 100));
		var thmArmRep = (rawArmRep / (1 - thmArmRes / 100));
		var expArmRep = (rawArmRep / (1 - expArmRes / 100));
		var cauArmRep = (rawArmRep / (1 - cauArmRes / 100));
		
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
		document.getElementById('outfitting_stats_raw_armour_repair').innerHTML = (rawArmRep ? formatNumHTML(rawArmRep, 1) : htmlNA);
		document.getElementById('outfitting_stats_kin_armour_repair').innerHTML = (rawArmRep ? formatNumHTML(kinArmRep, 1) : htmlNA);
		document.getElementById('outfitting_stats_thm_armour_repair').innerHTML = (rawArmRep ? formatNumHTML(thmArmRep, 1) : htmlNA);
		document.getElementById('outfitting_stats_exp_armour_repair').innerHTML = (rawArmRep ? formatNumHTML(expArmRep, 1) : htmlNA);
		document.getElementById('outfitting_stats_cau_armour_repair').innerHTML = (rawArmRep ? formatNumHTML(cauArmRep, 1) : htmlNA);
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
		var ammotime_wepcap = current.fit.getStat('ammotime_wepcap');
		var ammotime_nocap = current.fit.getStat('ammotime_nocap');
		var wepcap_burst_cur = current.fit.getStat('wepcap_burst_cur');
		var wepcap_burst_max = current.fit.getStat('wepcap_burst_max');
		var wepchg_sustain_cur = current.fit.getStat('wepchg_sustain_cur');
		var wepchg_sustain_max = current.fit.getStat('wepchg_sustain_max');
		
		// compute derived stats
		var curWpnSus = ((dps_nodistdraw + (dps_distdraw ? (dps_distdraw * wepchg_sustain_cur) : 0)) / dps);
		var maxWpnSus = ((dps_nodistdraw + (dps_distdraw ? (dps_distdraw * wepchg_sustain_max) : 0)) / dps);
		var ammWpnDur = min(ammotime_nocap, ((ammotime_wepcap <= wepcap_burst_max) ? ammotime_wepcap : (wepcap_burst_max + (ammotime_wepcap - wepcap_burst_max) / maxWpnSus)));
		
		// update displays
		var htmlNA = '<small class="semantic">N/A</small>';
		document.getElementById('outfitting_stats_wpn_raw_burst').innerHTML = (dps ? formatAttrHTML('dps', dps, 1) : htmlNA);
		document.getElementById('outfitting_stats_wpn_abs_burst').innerHTML = (dps ? formatPctHTML(dps_abs / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_thm_burst').innerHTML = (dps ? formatPctHTML(dps_thm / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_kin_burst').innerHTML = (dps ? formatPctHTML(dps_kin / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_exp_burst').innerHTML = (dps ? formatPctHTML(dps_exp / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_axe_burst').innerHTML = (dps ? formatPctHTML(dps_axe / dps, 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_cur_dur').innerHTML = (dps ? formatTimeHTML(wepcap_burst_cur) : htmlNA);
		document.getElementById('outfitting_stats_wpn_max_dur').innerHTML = (dps ? formatTimeHTML(wepcap_burst_max) : htmlNA);
		document.getElementById('outfitting_stats_wpn_amm_dur').innerHTML = (dps ? formatTimeHTML(ammWpnDur) : htmlNA);
		document.getElementById('outfitting_stats_wpn_cur_sus').innerHTML = (dps ? formatPctHTML(curWpnSus, 1) : htmlNA);
		document.getElementById('outfitting_stats_wpn_max_sus').innerHTML = (dps ? formatPctHTML(maxWpnSus, 1) : htmlNA);
	}; // updateUIStatsWpn()
	
	
	/*
	* ANALYSIS UI
	*/
	
	
	var initUIAnalysisRetrofit = function() {
		var els = document.forms.analysis.elements;
		
		var tbody = document.getElementById('analysis_retrofit_builds_table').tBodies[0];
		cache.template.analysis_retrofit_builds_row = tbody.removeChild(tbody.rows[0]);
		els.retrofit_builds_show_all.addEventListener('change', onUIAnalysisRetrofitSetupShowChange);
		els.retrofit_builds_add.addEventListener('click', onUIAnalysisRetrofitSetupAddClick);
		//els.retrofit_builds_add.addEventListener('change', onUIAnalysisRetrofitSetupAddChange);
		els.retrofit_builds_run.addEventListener('click', onUIAnalysisRetrofitSetupRunClick);
		
		var discounts = [0,0x1,0x2,0x3,0x4,0x5,0x8,0x9,0x10,0x11,0x20,0x21,0x3F];
		setDOMSelectLength(els.retrofit_setup_discount, discounts.length);
		for (var i = 0;  i < discounts.length;  i++) {
			var discountbits = discounts[i];
			var discountmod = cache.discountMod[discountbits];
			var text = formatPctText(1 - discountmod, ((discountbits & 0x1) && (discountmod > 0)) ? 1 : 0);
			if (discountmod == 1) {
				text += ' (never)';
			} else if (discountmod == 0) {
				text += ' (always)';
			} else if (discountbits != 0x1 && discountbits & 0x1) {
				text += ' (2.5% + ' + formatPctText(1 - cache.discountMod[discountbits & ~0x1], 0) + ')';
			}
			els.retrofit_setup_discount.options[i].value = discountbits;
			els.retrofit_setup_discount.options[i].text = text;
		}
		els.retrofit_setup_discount.selectedIndex = discounts.length - 1;
		
		/*
		setDOMSelectLength(els.retrofit_setup_disceng, 1 + MAX_BLUEPRINT_GRADE);
		setDOMSelectLength(els.retrofit_setup_bpgrade, 1 + MAX_BLUEPRINT_GRADE);
		for (var i = 0;  i <= MAX_BLUEPRINT_GRADE;  i++) {
			var text = 'grade ' + i + (i ? '' : ' (always ignore)');
			els.retrofit_setup_disceng.options[i].value = i;
			els.retrofit_setup_disceng.options[i].text = text;
			els.retrofit_setup_bpgrade.options[i].value = i;
			els.retrofit_setup_bpgrade.options[i].text = text;
		}
		els.retrofit_setup_disceng.selectedIndex = 1;
		els.retrofit_setup_bpgrade.selectedIndex = MAX_BLUEPRINT_GRADE;
		
		setDOMSelectLength(els.retrofit_setup_bproll, 21);
		for (var i = 0;  i < 21;  i++) {
			els.retrofit_setup_bproll.options[i].value = i * 0.05;
			els.retrofit_setup_bproll.options[i].text = formatPctText(i * 0.05, 0) + (i ? '' : ' (always ignore)');
		}
		els.retrofit_setup_bproll.selectedIndex = 20;
		*/
		
		var tbody = document.getElementById('analysis_retrofit_steps_table').tBodies[0];
		cache.template.analysis_retrofit_steps_row = tbody.removeChild(tbody.rows[0]);
		els.retrofit_steps_show_all.addEventListener('change', onUIAnalysisRetrofitStepsShowChange);
		
		var tbody = document.getElementById('analysis_retrofit_costs_table').tBodies[0];
		cache.template.analysis_retrofit_costs_row = tbody.removeChild(tbody.rows[1]);
		
		els.retrofit_export.addEventListener('click', onUIAnalysisRetrofitExportClick);
		
		addUIAnalysisRetrofitBuild('');
		document.getElementById('retrofit_export').disabled = true;
	}; // initUIAnalysisRetrofit()
	
	
	var onUIAnalysisTabChange = function(e) {
		if (e.target.name === 'tab' && e.target.checked) {
			setUIAnalysisTab(e.target.value);
		}
	}; // onUIAnalysisTabChange()
	
	
	var setUIAnalysisTab = function(tab) {
		current.analysis_tab = tab;
		document.forms.analysis.elements.tab.value = tab;
		document.forms.analysis.className = tab;
	}; // setUIAnalysisTab()
	
	
	var updateUIAnalysisStoredBuilds = function(oldnamehash, newnamehash) {
		/*
		var select = document.forms.analysis.elements.retrofit_builds_add;
		populateDOMSelectStoreds(select, current.stored.shipStoreds[0], '', 2);
		select.selectedIndex = 0;
		*/
		
		var tbody = document.getElementById('analysis_retrofit_builds_table').tBodies[0];
		var r = tbody.rows.length;
		while (r-- > 0) {
			var selects = tbody.rows[r].getElementsByTagName('SELECT');
			var namehash = selects[0].value;
			if (oldnamehash && namehash === oldnamehash)
				namehash = newnamehash;
			var stored = current.stored.shipNamehashStored[0][namehash];
			if (namehash && !stored) {
				tbody.removeChild(tbody.rows[r]);
			} else {
				var shipid = stored ? stored.shipid : (current.fit ? current.fit.getShipID() : -1);
				
				populateDOMSelectStoreds(selects[0], current.stored.shipStoreds[0], namehash, 1);
				if (selects[0].selectedIndex < 0)
					selects[0].selectedIndex = 0;
				
				var namehash = selects[1].value;
				if (oldnamehash && namehash === oldnamehash)
					namehash = newnamehash;
				populateDOMSelectStoreds(selects[1], current.stored.shipStoreds[shipid], namehash, 2);
				if (selects[1].selectedIndex < 0)
					selects[1].selectedIndex = 0;
			}
		}
	}; // updateUIAnalysisStoredBuilds()
	
	
	var onUIAnalysisRetrofitSetupShowChange = function(e) {
		e.stopPropagation();
		
		var checkboxAll = document.forms.analysis.elements.retrofit_builds_show_all;
		var checkboxes = document.getElementById('analysis_retrofit_builds_table').getElementsByTagName('INPUT');
		if (e.target === checkboxAll) {
			for (var i = 0;  i < checkboxes.length;  i++) {
				if (checkboxes[i] !== checkboxAll && checkboxes[i].name.startsWith('retrofit_builds_show_')) {
					checkboxes[i].checked = checkboxAll.checked;
				}
			}
		} else if (e.target.checked != checkboxAll.checked) {
			for (var i = 0;  i < checkboxes.length;  i++) {
				if (checkboxes[i] !== checkboxAll && checkboxes[i].name.startsWith('retrofit_builds_show_') && checkboxes[i].checked != e.target.checked) {
					return;
				}
			}
			checkboxAll.checked = e.target.checked;
		}
	}; // onUIAnalysisRetrofitSetupShowhange()
	
	
	var onUIAnalysisRetrofitSetupAddChange = function(e) {
		e.stopPropagation();
		var namehash = e.target.value;
		e.target.selectedIndex = 0;
		addUIAnalysisRetrofitBuild(namehash);
	}; // onUIAnalysisRetrofitSetupAddChange()
	
	
	var onUIAnalysisRetrofitSetupAddClick = function(e) {
		e.stopPropagation();
		e.preventDefault();
		addUIAnalysisRetrofitBuild('');
	}; // onUIAnalysisRetrofitSetupAddClick()
	
	
	var addUIAnalysisRetrofitBuild = function(namehash) {
		var shipid = namehash ? current.stored.shipNamehashStored[0][namehash].shipid : (current.fit ? current.fit.getShipID() : -1);
		var n = (current.counter.analysis_retrofit || 0) + 1;
		current.counter.analysis_retrofit = n;
		var tbody = document.getElementById('analysis_retrofit_builds_table').tBodies[0];
		var tr = cache.template.analysis_retrofit_builds_row.cloneNode(true);
		tbody.appendChild(tr);
		var els = document.forms.analysis.elements;
		populateDOMSelectStoreds(els.retrofit_builds_target_, current.stored.shipStoreds[0], namehash, 1);
		populateDOMSelectStoreds(els.retrofit_builds_base_, current.stored.shipStoreds[shipid], '', 2);
		els.retrofit_builds_target_.focus();
		els.retrofit_builds_base_.selectedIndex = 0;
		
		els.retrofit_builds_show_.addEventListener('change', onUIAnalysisRetrofitSetupShowChange);
		els.retrofit_builds_target_.addEventListener('change', onUIAnalysisRetrofitSetupTargetChange);
		els.retrofit_builds_delete_.addEventListener('click', onUIAnalysisRetrofitSetupDeleteClick);
		
		els.retrofit_builds_show_.name += n;
		els.retrofit_builds_target_.name += n;
		els.retrofit_builds_base_.name += n;
		els.retrofit_builds_delete_.name += n;
	}; // addUIAnalysisRetrofitBuild()
	
	
	var onUIAnalysisRetrofitSetupTargetChange = function(e) {
		e.stopPropagation();
		
		var namehash = e.target.value;
		var shipid = namehash ? current.stored.shipNamehashStored[0][namehash].shipid : current.fit.getShipID();
		var n = e.target.name.split('_')[3];
		var els = document.forms.analysis.elements;
		var select = els['retrofit_builds_base_' + n];
		populateDOMSelectStoreds(select, current.stored.shipStoreds[shipid], '', 2);
		select.selectedIndex = 0;
	}; // onUIAnalysisRetrofitSetupTargetChange()
	
	
	var onUIAnalysisRetrofitSetupDeleteClick = function(e) {
		e.stopPropagation();
		e.preventDefault();
		
		var tr = e.target;
		while (tr && tr.tagName !== 'TR')
			tr = tr.parentNode;
		if (tr)
			tr.parentNode.removeChild(tr);
	}; // onUIAnalysisRetrofitSetupDeleteClick()
	
	
	var onUIAnalysisRetrofitSetupRunClick = function(e) {
		e.stopPropagation();
		e.preventDefault();
		updateUIAnalysisRetrofit();
	}; // onUIAnalysisRetrofitSetupRunClick()
	
	
	var updateUIAnalysisRetrofit = function() {
		// gather settings
		var els = document.forms.analysis.elements;
		var limdisc = els.retrofit_setup_discount.value;
		var limdisceng = els.retrofit_setup_disceng.value;
		var limbpgrade = els.retrofit_setup_bpgrade.value;
		var limbproll = els.retrofit_setup_bproll.value;
		var limexpeffect = els.retrofit_setup_expeffect.value;
		var limrolls = [
			0,
			parseFloat(els.retrofit_setup_rolls1.value),
			parseFloat(els.retrofit_setup_rolls2.value),
			parseFloat(els.retrofit_setup_rolls3.value),
			parseFloat(els.retrofit_setup_rolls4.value),
			parseFloat(els.retrofit_setup_rolls5.value)
		];
		
		// initialize retrofit report and store metadata
		current.retrofit = {
			options: {
				rebuy_max_discount: parseFloat((1 - cache.discountMod[parseInt(els.retrofit_setup_discount.value)]).toFixed(6)),
				rebuy_max_bpgrade: parseInt(els.retrofit_setup_disceng.value),
				eng_max_bpgrade: parseInt(els.retrofit_setup_bpgrade.value),
				eng_max_bproll: parseFloat(els.retrofit_setup_bproll.value),
				eng_est_rolls: [
					0,
					parseFloat(els.retrofit_setup_rolls1.value),
					parseFloat(els.retrofit_setup_rolls2.value),
					parseFloat(els.retrofit_setup_rolls3.value),
					parseFloat(els.retrofit_setup_rolls4.value),
					parseFloat(els.retrofit_setup_rolls5.value)
				],
				exp_filter: els.retrofit_setup_expeffect.value
			},
			jobs: []
		};
		
		// generate all retrofit reports
		var checkboxes = document.getElementById('analysis_retrofit_builds_table').tBodies[0].getElementsByTagName('INPUT');
		for (var i = 0;  i < checkboxes.length;  i++) {
			if (checkboxes[i].checked && checkboxes[i].name.startsWith('retrofit_builds_show_')) {
				var n = checkboxes[i].name.split('_')[3];
				var namehash1 = els['retrofit_builds_base_' + n].value;
				var namehash2 = els['retrofit_builds_target_' + n].value;
				var stored1 = current.stored.shipNamehashStored[0][namehash1];
				var stored2 = current.stored.shipNamehashStored[0][namehash2];
				var build1 = (stored1 ? Build.fromHash(stored1.buildhash) : (namehash1 ? null : current.fit));
				var build2 = (stored2 ? Build.fromHash(stored2.buildhash) : (namehash2 ? null : current.fit));
				var steps = build2.getRetrofitData(build1, limdisc, limdisceng, limbpgrade, limbproll, limexpeffect, limrolls);
				current.retrofit.jobs.push({ name:(stored2 ? stored2.name : '(Current Build)'), baseline:(stored1 ? stored1.name : (namehash1 ? '(Stock Ship)' : '(Current Build')), sid:build2.getShipID(), steps:steps });
			}
		}
		
		// clear results table
		var table = document.getElementById('analysis_retrofit_steps_table');
		while (table.tBodies.length > 0)
			table.removeChild(table.tBodies[table.tBodies.length - 1]);
		
		// print new results
		table.classList.toggle('single', current.retrofit.jobs.length < 2);
		for (var i = 0;  i < current.retrofit.jobs.length;  i++) {
			var tbody = document.createElement('TBODY');
			table.appendChild(tbody);
			var nameHTML = encodeHTML(current.retrofit.jobs[i].name);
			var steps = current.retrofit.jobs[i].steps;
			for (var s = 0;  s < steps.length;  s++) {
				var ship = eddb.ship[steps[s].sid];
				var module = cache.shipModules[steps[s].sid][steps[s].mid] || eddb.module[steps[s].mid];
				var tr = cache.template.analysis_retrofit_steps_row.cloneNode(true);
				tr.cells[1].innerHTML = nameHTML;
				tr.cells[2].innerHTML = encodeHTML((steps[s].sgrp === 'ship') ? ship.name : (getModuleLabel(module) + (steps[s].num ? (' #' + steps[s].num) : '')));
				tr.cells[3].innerHTML = steps[s].act;
				tr.cells[4].innerHTML = encodeHTML(steps[s].desc || '');
				tbody.appendChild(tr);
				els.retrofit_steps_show_.addEventListener('change', onUIAnalysisRetrofitStepsShowChange);
				els.retrofit_steps_show_.name += (i + '_' + s);
			}
		}
		
		updateUIAnalysisRetrofitMaterials();
		document.getElementById('retrofit_export').disabled = (current.retrofit.jobs.length < 1);
	}; // updateUIAnalysisRetrofit()
	
	
	var onUIAnalysisRetrofitStepsShowChange = function(e) {
		e.stopPropagation();
		
		var checkboxAll = document.forms.analysis.elements.retrofit_steps_show_all;
		var checkboxes = document.getElementById('analysis_retrofit_steps_table').getElementsByTagName('INPUT');
		if (e.target === checkboxAll) {
			for (var i = 0;  i < checkboxes.length;  i++) {
				if (checkboxes[i] !== checkboxAll && checkboxes[i].name.startsWith('retrofit_steps_show_')) {
					checkboxes[i].checked = checkboxAll.checked;
				}
			}
		} else if (e.target.checked != checkboxAll.checked) {
			var same = true;
			for (var i = 0;  i < checkboxes.length;  i++) {
				if (checkboxes[i] !== checkboxAll && checkboxes[i].name.startsWith('retrofit_steps_show_') && checkboxes[i].checked != e.target.checked) {
					same = false;
					break;
				}
			}
			if (same)
				checkboxAll.checked = e.target.checked;
		}
		
		updateUIAnalysisRetrofitMaterials();
	}; // onUIAnalysisRetrofitStepsShowChange()
	
	
	var updateUIAnalysisRetrofitMaterials = function() {
		// clear results table
		var tbody = document.getElementById('analysis_retrofit_costs_table').tBodies[0];
		while (tbody.rows.length > 1)
			tbody.removeChild(tbody.rows[tbody.rows.length - 1]);
		
		// tally up results
		var matTotal = {'':0};
		var els = document.forms.analysis.elements;
		for (var i = 0;  i < current.retrofit.jobs.length;  i++) {
			var steps = current.retrofit.jobs[i].steps;
			for (var s = 0;  s < steps.length;  s++) {
				var checkbox = els['retrofit_steps_show_' + i + '_' + s];
				if (checkbox.checked) {
					for (var mat in steps[s].cost) {
						matTotal[mat] = (matTotal[mat] || 0) + steps[s].cost[mat];
					}
				}
			}
		}
		
		// print total cost
		tbody.rows[0].cells[1].innerHTML = formatPriceHTML(matTotal['']);
		delete matTotal[''];
		
		// print other materials
		var mats = Object.keys(matTotal);
		mats.sort(sortMaterials);
		for (var i = 0;  i < mats.length;  i++) {
			var material = eddb.material[mats[i]];
			var tr = cache.template.analysis_retrofit_costs_row.cloneNode(true);
			tr.cells[0].innerHTML = encodeHTML(material.name);
			tr.cells[1].innerHTML = encodeHTML(eddb.mattype[material.mattype].abbr);
			tr.cells[2].innerHTML = encodeHTML('G' + material.rarity);
			tr.cells[3].innerHTML = formatNumHTML(ceil(matTotal[mats[i]]), 0);
			tbody.appendChild(tr);
		}
	}; // updateUIAnalysisRetrofitMaterials()
	
	
	var showUIRetrofitExportPopup = function(stepsText, matsText, reportJSON, eddbioURL, edomhURL) {
		var trigger = document.getElementById('retrofit_export');
		var table = showUITablePopup(null, trigger, false, false, false);
		table.className = '';
		while (table.lastChild)
			table.removeChild(table.lastChild);
		var tbody = document.createElement('tbody');
		
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('Checklist'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.className = 'export';
		var div = document.createElement('div');
		div.className = 'export';
		var textarea = document.createElement('textarea');
		textarea.cols = 50;
		textarea.rows = 8;
		textarea.className = 'export';
		textarea.name = 'export_checklist';
		textarea.value = stepsText;
		textarea.addEventListener('focus', onUIPopupExportFieldFocus);
		div.appendChild(textarea);
		td.appendChild(div);
		tr.appendChild(td);
		var td = document.createElement('td');
		var button = document.createElement('button');
		button.innerHTML = HTML_ICON['clipboard'];
		button.addEventListener('click', onUIPopupExportCopyButtonClick);
		td.appendChild(button);
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('Materials'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.className = 'export';
		var div = document.createElement('div');
		div.className = 'export';
		var textarea = document.createElement('textarea');
		textarea.cols = 50;
		textarea.rows = 8;
		textarea.className = 'export';
		textarea.name = 'export_materials';
		textarea.value = matsText;
		textarea.addEventListener('focus', onUIPopupExportFieldFocus);
		div.appendChild(textarea);
		td.appendChild(div);
		tr.appendChild(td);
		var td = document.createElement('td');
		var button = document.createElement('button');
		button.innerHTML = HTML_ICON['clipboard'];
		button.addEventListener('click', onUIPopupExportCopyButtonClick);
		td.appendChild(button);
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('JSON'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.className = 'export';
		var div = document.createElement('div');
		div.className = 'export';
		var input = document.createElement('input');
		input.type = 'text';
		input.size = 50;
		input.className = 'export';
		input.name = 'export_json';
		input.value = reportJSON;
		input.addEventListener('focus', onUIPopupExportFieldFocus);
		div.appendChild(input);
		td.appendChild(div);
		tr.appendChild(td);
		var td = document.createElement('td');
		var button = document.createElement('button');
		button.innerHTML = HTML_ICON['clipboard'];
		button.addEventListener('click', onUIPopupExportCopyButtonClick);
		td.appendChild(button);
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.appendChild(document.createTextNode('External'));
		tr.appendChild(td);
		var td = document.createElement('td');
		td.className = 'export';
		var div = document.createElement('div');
		div.className = 'export';
		var link = document.createElement('a');
		link.className = 'button';
		link.href = eddbioURL;
		link.target = '_blank';
		link.innerHTML = '<img src="eddbio.png" class="iconsvg"> EDDB.io';
		div.appendChild(link);
		var link = document.createElement('a');
		link.className = 'button';
		if (edomhURL)
			link.href = edomhURL;
		link.target = '_blank';
		link.innerHTML = '<img src="edomh.png" class="iconsvg"> ' + (edomhURL ? 'EDOMH' : '<abbr title="EDOMH does not support direct import of multiple ships">EDOMH<svg class="iconsvg warning"><use xlink:href="#icon_warning"/></svg></abbr>');
		div.appendChild(link);
		td.appendChild(div);
		tr.appendChild(td);
		var td = document.createElement('td');
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		table.appendChild(tbody);
		document.forms.popup.elements.export_checklist.focus();
		document.forms.popup.elements.export_checklist.select();
		return true;
	}; // showUIRetrofitExportPopup()
	
	
	var onUIAnalysisRetrofitExportClick = function(e) {
		e.stopPropagation();
		e.preventDefault();
		if (!current.retrofit || current.retrofit.jobs.length < 1)
			return;
		
		// compile all enabled retrofit steps
		var els = document.forms.analysis.elements;
		var exportJSON = {
			retrofitOptions: current.retrofit.options,
			retrofits: [],
		};
		var cols = ['Build','Module','Action','Details'];
		var stepsText = [cols.join('\t')];
		var eddbioShips = {};
		var eddbioModules = {};
		var matTotal = {'':0};
		for (var i = 0;  i < current.retrofit.jobs.length;  i++) {
			var retroJSON = {
				target    : current.retrofit.jobs[i].name,
				baseline  : current.retrofit.jobs[i].baseline,
				ship      : eddb.ship[current.retrofit.jobs[i].sid].fdname,
				steps     : [],
				cost      : 0,
				materials : {},
			};
			exportJSON.retrofits.push(retroJSON);
			cols[0] = current.retrofit.jobs[i].name;
			var steps = current.retrofit.jobs[i].steps;
			for (var s = 0;  s < steps.length;  s++) {
				var ship = eddb.ship[steps[s].sid];
				var module = cache.shipModules[steps[s].sid][steps[s].mid] || eddb.module[steps[s].mid];
				var checkbox = els['retrofit_steps_show_' + i + '_' + s];
				
				var stepJSON = { enabled:!!checkbox.checked };
				if (steps[s].sgrp === 'ship') {
					stepJSON.ship = ship.fdname;
					if (steps[s].act === 'Sell') {
						stepJSON.action = 'sell';
						stepJSON.discount = parseFloat((1 - steps[s].discmod).toFixed(6));
					} else if (steps[s].act === 'Buy') {
						stepJSON.action = 'buy';
						stepJSON.discount = parseFloat((1 - steps[s].discmod).toFixed(6));
					}
				} else {
					stepJSON.module = module.fdname;
					stepJSON.index = steps[s].num;
					if (steps[s].act === 'Sell') {
						stepJSON.action = 'sell';
						stepJSON.discount = parseFloat((1 - steps[s].discmod).toFixed(6));
					} else if (steps[s].act === 'Buy') {
						stepJSON.action = 'buy';
						stepJSON.discount = parseFloat((1 - steps[s].discmod).toFixed(6));
					} else if (steps[s].act === 'Conv') {
						stepJSON.action = 'convert';
						stepJSON.blueprint = eddb.blueprint[steps[s].bpid].fdname;
						stepJSON.grade = steps[s].bpgrade;
					} else if (steps[s].act === 'Eng') {
						stepJSON.action = 'engineer';
						stepJSON.blueprint = eddb.blueprint[steps[s].bpid].fdname;
						stepJSON.grade = steps[s].bpgrade;
						stepJSON.progress = steps[s].bproll;
						stepJSON.rolls = steps[s].rolls;
					} else if (steps[s].act === 'Exp') {
						stepJSON.action = 'experimental';
						stepJSON.experimental = eddb.expeffect[steps[s].expid].fdname;
					}
				}
				if (stepJSON.action)
					retroJSON.steps.push(stepJSON);
				else if (current.dev) console.log('invalid retrofit step: '+JSON.stringify(steps[s]));
				
				if (checkbox.checked) {
					cols[1] = ((steps[s].sgrp === 'ship') ? ship.name : (getModuleLabel(module) + (steps[s].num ? (' #' + steps[s].num) : '')));
					cols[2] = steps[s].act;
					cols[3] = (steps[s].desc || '');
					stepsText.push(cols.join('\t'));
					
					if (steps[s].act === 'Buy') {
						if (steps[s].sgrp === 'ship' && ship.eddbid) {
							eddbioShips[ship.eddbid] = true;
						} else if (steps[s].sgrp !== 'ship' && module.eddbid && module.tag !== 'P') {
							eddbioModules[module.eddbid] = true;
						}
					}
					
					retroJSON.cost += (steps[s].cost[''] || 0);
					for (var mat in steps[s].cost) {
						matTotal[mat] = (matTotal[mat] || 0) + steps[s].cost[mat];
						var material = eddb.material[mat];
						if (material)
							retroJSON.materials[material.fdname] = (retroJSON.materials[material.fdname] || 0) + steps[s].cost[mat];
					}
				}
			}
		}
		stepsText.push('');
		
		// compile materials report
		cols = ['Item','Type','Lvl','Qty'];
		var matsText = [cols.join('\t')];
		cols = ['Credits','','',(matTotal[''] || 0)];
		matsText.push(cols.join('\t'));
		delete matTotal[''];
		var mats = Object.keys(matTotal);
		mats.sort(sortMaterials);
		for (var i = 0;  i < mats.length;  i++) {
			var material = eddb.material[mats[i]];
			if (material) {
				cols[0] = material.name;
				cols[1] = eddb.mattype[material.mattype].abbr;
				cols[2] = material.rarity;
				cols[3] = ceil(matTotal[mats[i]]).toFixed(0);
				matsText.push(cols.join('\t'));
			}
		}
		
		// finalize eddb.io link
		var eddbioURL = '';
		var ids = Object.keys(eddbioShips);
		if (ids.length > 0) {
			ids.sort();
			eddbioURL += (eddbioURL ? '&' : '?') + 's=' + ids.join(',');
		}
		ids = Object.keys(eddbioModules);
		if (ids.length > 0) {
			ids.sort();
			eddbioURL += (eddbioURL ? '&' : '?') + 'm=' + ids.join(',');
		}
		if (eddbioURL) {
			eddbioURL = 'https://eddb.io/station' + eddbioURL;
		}
		
		// create EDOMH link, if possible
		var edomhURL = null;
		if (exportJSON.retrofits.length == 1) {
			var json = exportJSON.retrofits[0];
			var obj = {
				"version": 1,
				"ship": (json.ship || '').toLowerCase(),
				"name": (json.target || ''),
				"items": [],
			};
			// iterate backwards to retain only the final engineering step for each module
			var m=null, i=null;
			for (var s = json.steps.length - 1;  s >= 0;  s--) {
				if (json.steps[s].action === 'engineer' && (m !== json.steps[s].module || i !== json.steps[s].index)) {
					m = json.steps[s].module;
					i = json.steps[s].index;
					obj.items.push({
						"item": (json.steps[s].module || '').toLowerCase(),
						"blueprint": (json.steps[s].blueprint || '').toLowerCase(),
						"grade": json.steps[s].grade,
						"highestGradePercentage": (json.steps[s].progress ? parseFloat(json.steps[s].progress.toFixed(6)) : 0),
					});
				} else if (json.steps[s].action === 'experimental') {
					obj.items.push({
						"item": (json.steps[s].module || '').toLowerCase(),
						"blueprint": (json.steps[s].experimental || '').toLowerCase(),
					});
				}
			}
			// encode
			if (obj.items.length > 0) {
				edomhURL = "edomh://edsy/?" + b64Encode(pako.deflate(JSON.stringify(obj), {to:'string'}));
			} else {
				edomhURL = '';
			}
		}
		
		// show popup
		showUIRetrofitExportPopup(stepsText.join('\n'), matsText.join('\n'), JSON.stringify(exportJSON), eddbioURL, edomhURL);
	}; // onUIAnalysisRetrofitExportClick()
	
	
	/*
	* OPTIONS UI
	*/
	
	
	var initUIOptions = function() {
		var rows = document.getElementById('options_insurance').getElementsByTagName('DD');
		for (var i = 0;  i < rows.length;  i++) {
			var input = rows[i].getElementsByTagName('INPUT')[0];
			var span = rows[i].getElementsByTagName('SPAN')[0];
			span.innerText = span.innerText.replace(/[0-9\.]+ *%/, formatPctText(parseFloat(input.value) / 10000, 1));
		}
		
		var container = document.getElementById('options_discounts_bits');
		while (container.lastElementChild)
			cache.template.options_discounts_bits_label = container.removeChild(container.lastElementChild);
		for (var i = 0;  i <= DISCOUNTS.length;  i++) {
			var bit = min(1 << i, 0x3F);
			var label = cache.template.options_discounts_bits_label.cloneNode(true);
			label.getElementsByTagName('INPUT')[0].value = bit;
			label.getElementsByTagName('DIV')[0].innerHTML = (bit == 0x3F) ? 'FREE' : formatPctHTML(1 - cache.discountMod[bit], (DISCOUNTS[DISCOUNTS.length - 1 - i] % 1 ? 1 : 0));
			container.appendChild(label);
			container.appendChild(document.createTextNode(' '));
		}
		
		var divBuiltinHardpoints = document.getElementById('options_builtin_hardpoints');
		while (divBuiltinHardpoints.lastChild)
			divBuiltinHardpoints.removeChild(divBuiltinHardpoints.lastChild);
		var divBuiltinOther = document.getElementById('options_builtin_other');
		while (divBuiltinOther.lastChild)
			divBuiltinOther.removeChild(divBuiltinOther.lastChild);
		for (var g = 0;  g < GROUPS.length;  g++) {
			var group = GROUPS[g];
			for (var t = 0;  t < (cache.groupMtypes[group] || EMPTY_ARR).length;  t++) {
				var mtype = cache.groupMtypes[group][t];
				for (var b = 0;  b < (cache.mtypeBuiltins[mtype] || EMPTY_ARR).length;  b++) {
					var bmodid = cache.mtypeBuiltins[mtype][b];
					var label = document.createElement('label');
					label.className = "checkbox left";
					var input = document.createElement('input');
					input.type = 'checkbox';
					input.name = 'builtin' + bmodid;
					input.disabled = !!BUILTIN_STORED_MODULES[bmodid].available;
					label.appendChild(input);
					var divWrapper = document.createElement('div');
					var divCheck = document.createElement('div');
					divCheck.className = "check";
					divWrapper.appendChild(divCheck);
					var span = document.createElement('span');
					span.innerText = BUILTIN_STORED_MODULES[bmodid].name;
					divWrapper.appendChild(span);
					label.appendChild(divWrapper);
					((group === 'hardpoint') ? divBuiltinHardpoints : divBuiltinOther).appendChild(label);
				}
			}
		}
	}; // initUIOptions()
	
	
	var updateUIOptions = function() {
		// validate options settings
		current.option.insurance = parseInt(current.option.insurance);
		current.option.discounts = min(max(parseInt(current.option.discounts), 0), 0x3F);
		if (!{none:1,some:1,all:1}[current.option.builtin])
			current.option.builtin = 'some';
		for (var bmodid in BUILTIN_STORED_MODULES) {
			var opt = 'builtin' + bmodid;
			current.option[opt] = !!current.option[opt];
		}
		current.option.onlybest = !!current.option.onlybest;
		current.option.experimental = !!current.option.experimental;
		current.option.show1 = !!current.option.show1;
		current.option.show2 = !!current.option.show2;
		current.option.show3 = !!current.option.show3;
		current.option.hidestats = !!current.option.hidestats;
		for (var i = 0;  i < CSS_FONTS.length;  i++) {
			var teststyle = new Option().style;
			var opt = 'font' + CSS_FONTS[i];
			if (current.option[opt].trim() === cache.option[opt] || !(teststyle.font = current.option[opt]) || !teststyle.font)
				current.option[opt] = '';
		}
		current.option.colorinvert = !!current.option.colorinvert;
		for (var i = 0;  i < CSS_COLORS.length;  i++) {
			for (var n = 1;  n <= 5;  n++) {
				var teststyle = new Option().style;
				var opt = 'color' + CSS_COLORS[i] + n;
				if (current.option[opt].trim() === cache.option[opt] || !(teststyle.color = current.option[opt]) || !teststyle.color)
					current.option[opt] = '';
			}
		}
		
		// apply options settings
		document.body.classList.toggle('onlybest', current.option.onlybest);
		document.body.classList.toggle('experimental', current.option.experimental);
		document.body.classList.toggle('show1', current.option.show1);
		document.body.classList.toggle('show2', current.option.show2);
		document.body.classList.toggle('show3', current.option.show3);
		var docstyle = document.documentElement.style;
		for (var i = 0;  i < CSS_FONTS.length;  i++) {
			var opt = 'font' + CSS_FONTS[i];
			docstyle.setProperty('--'+opt, current.option[opt] || cache.option[opt]);
		}
		docstyle.setProperty('--colorblack', (current.option.colorinvert ? 'white' : 'black'));
		docstyle.setProperty('--colorwhite', (current.option.colorinvert ? 'black' : 'white'));
		for (var n = 1;  n <= 5;  n++) {
			docstyle.setProperty('--colorgrey'+n, (current.option.colorinvert ? cache.option['colorgrey'+(6-n)] : cache.option['colorgrey'+n]));
		}
		for (var i = 0;  i < CSS_COLORS.length;  i++) {
			for (var n = 1;  n <= 5;  n++) {
				var opt = 'color' + CSS_COLORS[i] + n;
				docstyle.setProperty('--'+opt, current.option[opt] || cache.option[opt]);
			}
		}
		
		// update options controls
		var elements = document.forms.options.elements;
		elements.insurance.value = current.option.insurance;
		var inputs = document.getElementById('options_discounts_bits').getElementsByTagName('INPUT');
		for (var i = 0;  i < inputs.length;  i++) {
			if (inputs[i].name === 'discount') {
				var bit = parseInt(inputs[i].value);
				inputs[i].checked = (((current.option.discounts & bit) == bit) && ((current.option.discounts == 0x3F) == (bit == 0x3F)));
			}
		}
		elements.builtin.value = current.option.builtin;
		for (var bmodid in BUILTIN_STORED_MODULES) {
			var opt = 'builtin' + bmodid;
			elements[opt].checked = BUILTIN_STORED_MODULES[bmodid].available || current.option[opt];
		}
		document.getElementById('options_builtin').style.display = ((current.option.builtin === 'some') ? '' : 'none');
		elements.onlybest.checked = current.option.onlybest;
		elements.experimental.checked = current.option.experimental;
		elements.show1.checked = current.option.show1;
		elements.show2.checked = current.option.show2;
		elements.show3.checked = current.option.show3;
		elements.hidestats.checked = current.option.hidestats;
		for (var i = 0;  i < CSS_FONTS.length;  i++) {
			var opt = 'font' + CSS_FONTS[i];
			elements[opt].value = current.option[opt] || cache.option[opt];
		}
		elements.colorinvert.checked = current.option.colorinvert;
		for (var i = 0;  i < CSS_COLORS.length;  i++) {
			for (var n = 1;  n <= 5;  n++) {
				var opt = 'color' + CSS_COLORS[i] + n;
				elements[opt].value = current.option[opt] || cache.option[opt];
			}
		}
	}; // updateUIOptions()
	
	
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
	
	
	var onBodyClickCapture = function(e) {
		var input;
		// if any popout is open, and we didn't click inside it, close it
		var popouts = document.getElementsByClassName('popout');
		var p = popouts.length;
		while (p--) {
			for (input = popouts[p].firstChild;  input && (!input.classList || !input.classList.contains('toggleinput'));  input = input.nextSibling)
				;
			if (input && input.checked && !popouts[p].contains(e.target))
				input.checked = false;
		}
	}; // onBodyClickCapture()
	
	
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
		var file = e.dataTransfer.files[0]; // TODO: handle multiple files
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
		importData(e.target.result);
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
	
	
	var onUIPopupImportButtonClick = function(e) {
		e.preventDefault();
		switch (e.currentTarget.name) {
		case 'fdapi_import':
			hideUIPopup();
			importData('FDAPI:' + e.currentTarget.value);
			e.stopPropagation();
			return false;
			
		case 'fdapi_delete':
			var cookie = 'edsy' + (current.dev ? 'dev' : '') + '_fdapi_cmdr_' + e.currentTarget.value + '=; path=' + (current.dev ? '/dev' : '/') + '; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=lax';
			document.cookie = cookie;
			hideUIPopup();
			showUIImportPopup();
			e.stopPropagation();
			return false;
			
		case 'import_ignore':
		case 'import_save':
		case 'import_saveas':
			var action = e.currentTarget.name.split('_')[1];
			var el;
			for (var i = 0;  el = document.getElementById('import_store_'+i+'_'+action);  i++) {
				if (!el.disabled)
					el.checked = true;
			}
			e.stopPropagation();
			return false;
			
		case 'import_load_none':
			var i = document.forms.popup.elements.import_load.value;
			var el = document.getElementById('import_load_' + i);
			if (el)
				el.checked = false;
			e.stopPropagation();
			return false;
		}
		return true;
	}; // onUIPopupImportButtonClick()
	
	
	var onUIPopupExportShortButtonClick = function(e) {
		document.forms.popup.elements.export_short_gen_button.disabled = true;
		document.forms.popup.elements.export_short_gen_button.innerHTML = 'Generating ...';
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				document.forms.popup.elements.export_short_gen_button.style.display = 'none';
				document.forms.popup.elements.export_short.style.display = 'inline-block';
				document.forms.popup.elements.export_short_button.style.display = 'inline-block';
				document.forms.popup.elements.export_short.value = request.responseText.split('\n',1)[0];
				document.forms.popup.elements.export_short.focus();
				document.forms.popup.elements.export_short.select();
			}
		}; // onreadystatechange()
		request.open('GET', 'shortlink?url=' + encodeURIComponent(current.fit.getEDSYURL()), true);
		request.timeout = 10000;
		request.send();
	}; // onUIPopupExportShortButtonClick()
	
	
	var onUIPopupExportFieldFocus = function(e) {
		if (e.target.select)
			e.target.select();
	}; // onUIPopupExportFieldFocus()
	
	
	var onUIPopupExportCopyButtonClick = function(e) {
		e.preventDefault();
		e.stopPropagation();
		var tr = e.target;
		while (tr && tr.tagName !== 'TR')
			tr = tr.parentNode;
		if (tr) {
			var inputs = tr.getElementsByTagName('INPUT');
			var textareas = tr.getElementsByTagName('TEXTAREA');
			var el = inputs[0] || textareas[0];
			if (el && el.focus && el.select) {
				el.focus();
				el.select();
				try {
					document.execCommand('copy');
				} catch (exc) {
				}
			}
		}
	}; // onUIPopupExportCopyButtonClick()
	
	
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
		while (el && el.tagName !== 'BUTTON' && el.tagName !== 'INPUT') {
			el = el.parentNode;
		}
		if (!el || el.disabled) {
		} else if (el.tagName === 'BUTTON') {
			e.stopPropagation();
			e.preventDefault();
			var tokens = el.name.split('_');
			if (tokens[1] === 'ship') {
				setCurrentFit(new Build(el.value, true), '');
				setUIPageTab('outfitting');
				updateUIAnalysisStoredBuilds();
			}
		} else {
			var table = el;
			while (table && table.tagName !== 'TABLE')
				table = table.parentNode;
			var state = sortUIShipyardTable(table, UI_SHIPYARD_SHIPS_COLS, parseInt(el.value));
			if (state) {
				el.classList.toggle('asc', !state.desc);
				el.classList.toggle('desc', !!state.desc);
				el.classList.toggle('key1', !state.alt);
				el.classList.toggle('key2', !!state.alt);
			}
		}
	}; // onUIShipyardShipsClick()
	
	
	var onUIShipyardStoredBuildsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON' && el.tagName !== 'INPUT') {
			el = el.parentNode;
		}
		if (!el || el.disabled) {
		} else if (el.tagName === 'BUTTON') {
			e.stopPropagation();
			e.preventDefault();
			var tokens = el.name.split('_');
			switch (tokens[1]) {
			case 'reload':
				setCurrentFitNameHash(el.value);
				setUIPageTab('outfitting');
				updateUIAnalysisStoredBuilds();
				break;
				
			case 'rename':
				renameStoredBuild(el.value);
				break;
				
			case 'delete':
				deleteStoredBuild(el.value);
				break;
			}
		} else {
			var table = el;
			while (table && table.tagName !== 'TABLE')
				table = table.parentNode;
			var state = sortUIShipyardTable(table, UI_SHIPYARD_STOREDBUILD_COLS, parseInt(el.value));
			if (state) {
				el.classList.toggle('asc', !state.desc);
				el.classList.toggle('desc', !!state.desc);
				el.classList.toggle('key1', !state.alt);
				el.classList.toggle('key2', !!state.alt);
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
			return onUIModulePickerLabelTouchCancel(e);
		}
		if (touchdata) {
			clearTimeout(touchdata.timeout);
		} else {
			current.pickerTouch[inputID] = touchdata = { timeout:null, x:0, y:0 };
		}
		touchdata.timeout = setTimeout(onUIModulePickerLabelTouchTimeout, TIMEOUT_LONGPRESS, inputID);
		touchdata.x = e.touches[0].screenX;
		touchdata.y = e.touches[0].screenY;
		label.classList.add('active');
		label.addEventListener('touchmove', onUIModulePickerLabelTouchMove);
		label.addEventListener('touchend', onUIModulePickerLabelTouchEnd);
		label.addEventListener('touchcancel', onUIModulePickerLabelTouchCancel);
		return true;
	}; // onUIModulePickerLabelTouchStart()
	
	
	var onUIModulePickerLabelTouchMove = function(e) {
		e.stopPropagation();
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.pickerTouch[inputID];
		if (!touchdata || e.touches.length !== 1 || abs(e.touches[0].screenX - touchdata.x) > TOLERANCE_TOUCH || abs(e.touches[0].screenY - touchdata.y) > TOLERANCE_TOUCH) {
			return onUIModulePickerLabelTouchCancel(e);
		}
		if (e.cancelable)
			e.preventDefault();
		return false;
	}; // onUIModulePickerLabelTouchMove()
	
	
	var onUIModulePickerLabelTouchEnd = function(e) {
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.pickerTouch[inputID];
		onUIModulePickerLabelTouchCancel(e);
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
	
	
	var onUIModulePickerLabelTouchCancel = function(e, label) {
		if (e) {
			e.stopPropagation();
			label = e.currentTarget;
		}
		var inputID = label.htmlFor;
		var touchdata = current.pickerTouch[inputID];
		if (touchdata) {
			clearTimeout(touchdata.timeout);
			delete current.pickerTouch[inputID];
		}
		label.classList.remove('active');
		label.removeEventListener('touchmove', onUIModulePickerLabelTouchMove);
		label.removeEventListener('touchend', onUIModulePickerLabelTouchEnd);
		label.removeEventListener('touchcancel', onUIModulePickerLabelTouchCancel);
		return true;
	}; // onUIModulePickerLabelTouchCancel()
	
	
	var onUIModulePickerLabelTouchTimeout = function(inputID) {
		var input = document.getElementById(inputID);
		var label = input.parentNode;
		var touchdata = current.pickerTouch[inputID];
		onUIModulePickerLabelTouchCancel(null, label);
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
		} else {
			onDocumentDragEnter(e);
		}
	}; // onUIModulePickerDragEnter()
	
	
	var onUIModulePickerDragOver = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/slot')) {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
		} else {
			onDocumentDragOver(e);
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
		} else {
			onDocumentDrop(e);
		}
	}; // onUIModulePickerDrop()
	
	
	var onUIFitSettingsStoredClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON')
			el = el.parentNode;
		if (!el || el.disabled)
			return;
		
		e.preventDefault();
		var namehash = document.forms.fit.elements.outfitting_fit_stored.value;
		switch (el.id) {
		case 'outfitting_fit_stored_reload':
			setCurrentFitNameHash(namehash);
			updateUIAnalysisStoredBuilds();
			break;
			
		case 'outfitting_fit_stored_save':
			saveCurrentStoredBuild(false);
			break;
			
		case 'outfitting_fit_stored_saveas':
			saveCurrentStoredBuild(true);
			break;
			
		case 'outfitting_fit_stored_rename':
			renameStoredBuild(namehash);
			break;
			
		case 'outfitting_fit_stored_delete':
			deleteStoredBuild(namehash);
			break;
		
		default:
			console.log('onUIFitSettingsStoredClick({target.id="'+el.id+'"})');
		}
	}; // onUIFitSettingsStoredClick()
	
	
	var onUIFitSettingsStoredChange = function(e) {
		if (e.target.name === 'outfitting_fit_stored') {
			var inaraAcct = current.fit.inaraAcct;
			var inaraShip = current.fit.inaraShip;
			var inaraURL = current.fit.getInaraURL();
			if (setCurrentFitNameHash(e.target.value)) {
				if (current.fit.setInaraXref(inaraAcct, inaraShip) && inaraURL) {
					// TODO: not like this :X
					document.getElementById('fit_header_export').style.display = (inaraURL ? '' : 'none');
					document.forms.fit.elements.export_inara.style.display = (inaraURL ? '' : 'none');
				}
				updateUIAnalysisStoredBuilds();
			}
		}
	}; // onUIFitSettingsStoredChange()
	
	
	var onUIFitSettingsColsChange = function(e) {
		updateUIFitColumns();
		// let the changes finish rendering
		setTimeout(updateUILayout, 1);
	}; // onUIFitSettingsColsChange()
	
	
	var onUIFitSettingsOpsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON')
			el = el.parentNode;
		if (!el || el.disabled)
			return;
		
		e.preventDefault();
		document.getElementById('outfitting_ops_toggle').checked = false;
		switch (el.id) {
		case 'outfitting_fit_import':
			showUIImportPopup();
			break;
			
		case 'outfitting_fit_export':
			showUIExportPopup();
			break;
			
		case 'outfitting_fit_discounts':
			var discounts = current.fit.getSlot(current.group, current.slot).getDiscounts();
			updateUIFitDiscounts(discounts);
			break;
		}
	}; // onUIFitSettingsOpsClick()
	
	
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


	var onUIFitSlotsContextMenu = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'LABEL' && el.tagName !== 'INPUT' && el.tagName !== 'BUTTON') {
			el = el.parentNode;
		}
		if (!el) {
		} else if (el.tagName === 'LABEL') {
		} else if (el.tagName === 'BUTTON') {
			e.preventDefault();
			var tokens = el.name.split('_');
			if (el.disabled) {
			} else if (tokens[0] === 'priority') {
				changeCurrentFitSlotPriority(tokens[1], tokens[2], -1);
			} else if (tokens[0] === 'crewdist') {
			} else if (tokens[0] === 'powerdist') {
			}
		} else if (el.tagName === 'INPUT') {
		}
	}; // onUIFitSlotsContextMenu()
	
	
	var onUIFitExportInaraButtonClick = function(e) {
		e.preventDefault();
		e.stopPropagation();
		var inaraURL = current.fit.getInaraURL();
		if (!inaraURL)
			return;
		var form = document.createElement('form');
		form.method = 'POST';
		form.action = inaraURL;
		var input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'externalslefimport';
		input.value = current.fit.exportSLEF();
		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
	}; // onUIFitExportInaraButtonClick()
	
	
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
			return onUIFitSlotsTouchCancel(e);
		}
		if (touchdata) {
			clearTimeout(touchdata.timeout);
		} else {
			current.slotsTouch[inputID] = touchdata = { timeout:null, x:0, y:0 };
		}
		touchdata.timeout = setTimeout(onUIFitSlotsTouchTimeout, TIMEOUT_LONGPRESS, inputID);
		touchdata.x = e.touches[0].screenX;
		touchdata.y = e.touches[0].screenY;
		label.classList.add('active');
		label.addEventListener('touchmove', onUIFitSlotsTouchMove);
		label.addEventListener('touchend', onUIFitSlotsTouchEnd);
		label.addEventListener('touchcancel', onUIFitSlotsTouchCancel);
		return true;
	}; // onUIFitSlotsTouchStart()
	
	
	var onUIFitSlotsTouchMove = function(e) {
		e.stopPropagation();
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.slotsTouch[inputID];
		if (!touchdata || e.touches.length !== 1 || abs(e.touches[0].screenX - touchdata.x) > TOLERANCE_TOUCH || abs(e.touches[0].screenY - touchdata.y) > TOLERANCE_TOUCH) {
			return onUIFitSlotsTouchCancel(e);
		}
		if (e.cancelable)
			e.preventDefault();
		return false;
	}; // onUIFitSlotsTouchMove()
	
	
	var onUIFitSlotsTouchEnd = function(e) {
		var label = e.currentTarget;
		var inputID = label.htmlFor;
		var touchdata = current.slotsTouch[inputID];
		onUIFitSlotsTouchCancel(e);
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
	
	
	var onUIFitSlotsTouchCancel = function(e, label) {
		if (e) {
			e.stopPropagation();
			label = e.currentTarget;
		}
		var inputID = label.htmlFor;
		var touchdata = current.slotsTouch[inputID];
		if (touchdata) {
			clearTimeout(touchdata.timeout);
			delete current.slotsTouch[inputID];
		}
		label.classList.remove('active');
		label.removeEventListener('touchmove', onUIFitSlotsTouchMove);
		label.removeEventListener('touchend', onUIFitSlotsTouchEnd);
		label.removeEventListener('touchcancel', onUIFitSlotsTouchCancel);
		return true;
	}; // onUIFitSlotsTouchCancel()
	
	
	var onUIFitSlotsTouchTimeout = function(inputID) {
		var input = document.getElementById(inputID);
		var label = input.parentNode;
		var touchdata = current.slotsTouch[inputID];
		onUIFitSlotsTouchCancel(null, label);
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
		} else {
			onDocumentDragEnter(e);
		}
	}; // onUIFitSlotsDragEnter()
	
	
	var onUIFitSlotsDragOver = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/mid')) {
			e.preventDefault();
		} else {
			onDocumentDragOver(e);
		}
	}; // onUIFitSlotsDragOver()
	
	
	var onUIFitSlotsDragLeave = function(e) {
		// TODO: .dragready highlighting?
	}; // onUIFitSlotsDragLeave()
	
	
	var onUIFitSlotsDrop = function(e) {
		var tr = e.target;
		while (tr && tr.tagName !== 'TR')
			tr = tr.parentNode;
		if (tr && contains(e.dataTransfer.types, 'edsy/mid')) {
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
				if (isDropEffectCopy(e)) {
					copyCurrentFitSlotModule(group1, slot1, group2, slot2);
				} else {
					swapCurrentFitSlotModules(group1, slot1, group2, slot2);
				}
			} else {
				e.preventDefault();
				e.stopPropagation();
				setCurrentFitSlotModule(group2, slot2, modid, namehash);
			}
		} else {
			onDocumentDrop(e);
		}
	}; // onUIFitSlotsDrop()
	
	
	var onUIDetailsSettingsChange = function(e) {
		if (e.target.name === 'outfitting_details_stored') {
			setUIDetailsNameHash(e.target.value);
		}
	}; // onUIDetailsSettingsChange()
	
	
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
	}; // onUIDetailsSettingsClick()
	
	
	var onUIDetailsModuleChange = function(e) {
		if (e.target.name === 'cost') {
			if (e.target.value) {
				// TODO input as discounts?
				setUIDetailsCost(parseNumText(e.target.value));
			} else {
				setUIDetailsDiscounts(0);
			}
		} else if (e.target.name === 'discount') {
			var slot = getUIOutfittingSlot();
			var bit = parseInt(e.target.value);
			if (bit) {
				var discounts = slot.getDiscounts();
				if (e.target.checked) {
					discounts = (((discounts == 0x3F) ? 0 : discounts) | bit);
				} else {
					discounts = (discounts & ~bit);
				}
				setUIDetailsDiscounts(discounts);
			} else {
				if (e.target.checked) {
					setUIDetailsCost(slot.getCost());
				} else {
					setUIDetailsDiscounts(slot.getDiscounts());
				}
			} 
		} else if (e.target.name === 'blueprint') {
			setUIDetailsBlueprintID(e.target.value);
		} else if (e.target.name === 'blueprint_grade') {
			setUIDetailsBlueprintGrade(parseInt(e.target.value));
		} else if (e.target.name === 'blueprint_roll') {
			var value = e.target.value.trim();
			if (value) {
				value = parseNumText(e.target.value);
				setUIDetailsBlueprintRoll(isNaN(value) ? null : (value / 100.0));
			} else {
				updateUIDetailsBlueprintRoll();
			}
		} else if (e.target.name === 'expeffect') {
			setUIDetailsExpeffect(e.target.value);
		} else if (e.target.tagName === 'INPUT') {
			setUIDetailsAttrText(e.target.name, e.target.value);
		}
	}; // onUIDetailsModuleChange()
	
	
	var onUIDetailsRollTouchStart = function(e) {
		var el = e.target;
		while (el && el !== e.currentTarget) {
			if (el.tagName === 'INPUT')
				return onUIDetailsRollTouchCancel(e);
			el = el.parentNode;
		}
		var input = document.forms.details.elements.blueprint_roll;
		if (!el || input.disabled || e.touches.length !== 1)
			return onUIDetailsRollTouchCancel(e);
		e.preventDefault();
		e.stopPropagation();
		var rect = input.getBoundingClientRect();
		var touchdata = current.bprollTouch = {
			x:  (rect.right + rect.left) / 2,
			rx: (rect.right - rect.left) / 2,
			y:  (rect.bottom + rect.top) / 2,
			ry: (rect.bottom - rect.top) / 2,
		};
		var el = document.getElementById('engineering_roll');
		el.addEventListener('touchmove', onUIDetailsRollTouchMove);
		el.addEventListener('touchend', onUIDetailsRollTouchEnd);
		el.addEventListener('touchcancel', onUIDetailsRollTouchCancel);
		return onUIDetailsRollTouchMove(e);
	}; // onUIDetailsRollTouchStart()
	
	
	var onUIDetailsRollTouchMove = function(e) {
		var touchdata = current.bprollTouch;
		if (!touchdata || e.touches.length !== 1)
			return onUIDetailsRollTouchCancel(e);
		e.preventDefault();
		e.stopPropagation();
		var obj = e.touches[0];
		var dx = obj.clientX - touchdata.x;
		var dy = obj.clientY - touchdata.y;
		var bproll = (((abs(dx) <= touchdata.rx) && (abs(dy) <= touchdata.ry)) ? -1 : (ceil((0.5 - atan2(dx,dy) / PI / 2) * 20) / 20));
		updateUIDetailsBlueprintRoll(bproll);
	}; // onUIDetailsRollTouchMove()
	
	
	var onUIDetailsRollTouchEnd = function(e) {
		e.preventDefault();
		e.stopPropagation();
		onUIDetailsRollTouchCancel(e);
		var value = parseNumText(document.forms.details.elements.blueprint_roll.value);
		setUIDetailsBlueprintRoll(isNaN(value) ? null : (value / 100.0));
	}; // onUIDetailsRollTouchEnd()
	
	
	var onUIDetailsRollTouchCancel = function(e) {
		current.bprollTouch = null;
		var el = document.getElementById('engineering_roll');
		el.removeEventListener('touchmove', onUIDetailsRollTouchMove);
		el.removeEventListener('touchend', onUIDetailsRollTouchEnd);
		el.removeEventListener('touchcancel', onUIDetailsRollTouchCancel);
	}; // onUIDetailsRollTouchCancel()
	
	
	var onUIDetailsRollMouseDown = function(e) {
		var el = e.target;
		while (el && el !== e.currentTarget) {
			if (el.tagName === 'INPUT')
				return;
			el = el.parentNode;
		}
		var input = document.forms.details.elements.blueprint_roll;
		if (!el || input.disabled)
			return;
		e.preventDefault();
		e.stopPropagation();
		var rect = input.getBoundingClientRect();
		var clickdata = current.bprollClick = {
			x:  (rect.right + rect.left) / 2,
			y:  (rect.bottom + rect.top) / 2,
		};
		document.addEventListener('mousemove', onUIDetailsRollMouseMove, true);
		document.addEventListener('mouseup', onUIDetailsRollMouseUp, true);
		return onUIDetailsRollMouseMove(e);
	}; // onUIDetailsRollMouseDown()
	
	
	var onUIDetailsRollMouseMove = function(e) {
		var clickdata = current.bprollClick;
		if (!clickdata)
			return onUIDetailsRollMouseUp(e);
		var obj = e;
		var dx = obj.clientX - clickdata.x;
		var dy = obj.clientY - clickdata.y;
		var bproll = ((e.target === document.forms.details.elements.blueprint_roll) ? -1 : (ceil((0.5 - atan2(dx,dy) / PI / 2) * 20.0) / 20.0));
		updateUIDetailsBlueprintRoll(bproll);
	}; // onUIDetailsRollMouseMove()
	
	
	var onUIDetailsRollMouseUp = function(e) {
		current.bprollClick = null;
		document.removeEventListener('mousemove', onUIDetailsRollMouseMove, true);
		document.removeEventListener('mouseup', onUIDetailsRollMouseUp, true);
		var value = parseNumText(document.forms.details.elements.blueprint_roll.value);
		setUIDetailsBlueprintRoll(isNaN(value) ? null : (value / 100.0));
	}; // onUIDetailsRollMouseUp()
	
	
	var onUIDetailsRollButtonClick = function(e) {
		e.preventDefault();
		e.stopPropagation();
		setUIDetailsBlueprintRoll(e.target.value);
	}; // onUIDetailsRollButtonClick()
	
	
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
		var value = parseNumText(e.target.value);
		var step = (e.shiftKey ? 10 : 1);
		value = formatNumText(((mod > 0) ? (floor(round(value / pow(10, -scale)) / step) + 1) : (ceil(round(value / pow(10, -scale)) / step) - 1)) * pow(10, -scale) * step, scale);
		switch (e.target.name) {
		case 'stats_cur_fuel':   setStatsCurFuel(value);   break;
		case 'stats_cur_cargo':  setStatsCurCargo(value);  break;
		}
	}; // onUIStatsInputWheel()
	
	
	var onUIStatsInputChange = function(e) {
		e.stopPropagation();
		switch (e.target.name) {
		case 'stats_cur_fuel':   setStatsCurFuel(parseNumText(e.target.value) || 0);   break;
		case 'stats_cur_cargo':  setStatsCurCargo(parseNumText(e.target.value) || 0);  break;
		}
	}; // onUIStatsInputChange()
	
	
	var onUIOptionsChange = function(e) {
		var elements = document.forms.options.elements;
		current.option.insurance = parseInt(elements.insurance.value);
		var inputs = document.getElementById('options_discounts_bits').getElementsByTagName('INPUT');
		current.option.discounts = 0;
		for (var i = 0;  i < inputs.length;  i++) {
			if (inputs[i].name === 'discount' && inputs[i].checked && (inputs[i] == e.target || inputs[i].value != 0x3F)) {
				current.option.discounts |= parseInt(inputs[i].value);
			}
		}
		current.option.builtin = elements.builtin.value;
		for (var bmodid in BUILTIN_STORED_MODULES) {
			var opt = 'builtin' + bmodid;
			current.option[opt] = elements[opt].checked;
		}
		current.option.onlybest = elements.onlybest.checked;
		current.option.experimental = elements.experimental.checked;
		current.option.show1 = elements.show1.checked;
		current.option.show2 = elements.show2.checked;
		current.option.show3 = elements.show3.checked;
		current.option.hidestats = elements.hidestats.checked;
		for (var i = 0;  i < CSS_FONTS.length;  i++) {
			var opt = 'font' + CSS_FONTS[i];
			current.option[opt] = elements[opt].value;
		}
		current.option.colorinvert = elements.colorinvert.checked;
		for (var i = 0;  i < CSS_COLORS.length;  i++) {
			for (var n = 1;  n <= 5;  n++) {
				var opt = 'color' + CSS_COLORS[i] + n;
				current.option[opt] = elements[opt].value;
			}
		}
		updateUIOptions();
		
		updateUILayout();
		readStoredModules();
		updateUIModulePickerStoredModules();
		updateUIDetailsStoredModules();
		updateUIDetailsStoredModuleControls();
		updateUIDetailsModifications();
		updateUIStatsPanels();
		updateUIStatsTotals();
		
		writeStoredOptions();
	}; // onUIOptionsChange()
	
	
	var onUIOptionsClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON')
			el = el.parentNode;
		if (!el || el.disabled) {
		} else if (el.name === 'colormatrix') {
			e.stopPropagation();
			e.preventDefault();
			var xml = prompt("Paste your <GUIColour><Default> color matrix here:", '');
			if (!xml)
				return;
			var matrix = {};
			var reColorMatrix = /< *matrix(red|green|blue) *> *([-0-9\.]+) *, *([-0-9\.]+) *, *([-0-9\.]+) *< *\/ *matrix\1 *>/gi;
			for (var match;  match = reColorMatrix.exec(xml);  ) {
				var r = parseFloat(match[2]);
				var g = parseFloat(match[3]);
				var b = parseFloat(match[4]);
				if (!(isNaN(r) || isNaN(g) || isNaN(b))) {
					matrix[match[1].toLowerCase()] = [r,g,b];
				}
			}
			if (!matrix.red || !matrix.green || !matrix.blue) {
				alert('Error: Invalid color matrix');
				return;
			}
			for (var i = 0;  i < CSS_COLORS.length;  i++) {
				for (var n = 1;  n <= 5;  n++) {
					var opt = 'color' + CSS_COLORS[i] + n;
					var r0 = parseInt(cache.option[opt].slice(1,3), 16);
					var g0 = parseInt(cache.option[opt].slice(3,5), 16);
					var b0 = parseInt(cache.option[opt].slice(5,7), 16);
					var r1 = ('0' + min(max(((r0*matrix.red[0] + g0*matrix.green[0] + b0*matrix.blue[0] + 0.5) | 0), 0), 255).toString(16)).slice(-2);
					var g1 = ('0' + min(max(((r0*matrix.red[1] + g0*matrix.green[1] + b0*matrix.blue[1] + 0.5) | 0), 0), 255).toString(16)).slice(-2);
					var b1 = ('0' + min(max(((r0*matrix.red[2] + g0*matrix.green[2] + b0*matrix.blue[2] + 0.5) | 0), 0), 255).toString(16)).slice(-2);
					current.option[opt] = '#'+r1+g1+b1;
				}
			}
			updateUIOptions();
		} else if (el.name === 'reset') {
			var elements = document.forms.options.elements;
			if (el.value.slice(0,4) === 'font') {
				elements[el.value].value = '';
			} else if (el.value === 'colorinvert') {
				elements[el.value].checked = false;
			} else if (el.value.slice(0,5) === 'color') {
				for (var n = 1;  n <= 5;  n++)
					elements[el.value + n].value = '';
			} else {
				return;
			}
			e.stopPropagation();
			e.preventDefault();
			onUIOptionsChange(e);
		}
	}; // onUIOptionsClick()
	
	
	var onUIOptionsBackupClick = function(e) {
		e.preventDefault();
		e.stopPropagation();
		var obj = {
			format: 'edsy',
			version: VERSIONS[3],
		//	imports: current.importLabel, // no need to migrate this; it's a minor convenience, easy enough to re-populate, and may get bloated over time
			builds: {},
			modules: {},
			options: current.option,
		};
		for (var namehash in current.stored.shipNamehashStored[0])
			obj.builds[namehash] = current.stored.shipNamehashStored[0][namehash].buildhash;
		for (var namehash in current.stored.moduleNamehashStored[0]) {
			// skip builtins
			if (!hashDecodeS(namehash).startsWith(" "))
				obj.modules[namehash] = current.stored.moduleNamehashStored[0][namehash].modulehash;
		}
		var json = JSON.stringify(obj, null, 2);
		showUITextPopup(
				'Below is a JSON object encoding all stored builds, modules, and other preferences, suitable for backup or transfer to another device or browser.',
				json,
				e.target, false,
				true, false
		);
	}; // onUIOptionsBackupClick()
	
	
	var onUIOptionsRestoreClick = function(e) {
		e.preventDefault();
		e.stopPropagation();
		showUIImportPopup();
	}; // onUIOptionsRestoreClick()
	
	
	var onWindowHashChange = function(e) {
		processURLHash(window.location, true);
	}; // onWindowHashChange()
	
	
	var onBodyFocus = function(e) {
		if (e.target.tagName === 'INPUT' && e.target.type === 'text' && e.target.select)
			e.target.select();
	}; // onBodyFocus()
	
	
	var onFormSubmit = function(e) {
		e.preventDefault();
	}; // onFormSubmit()
	
	
	var onStorageEvent = function(e) {
		readStoredOptions();
		updateUIOptions();
		readStoredImports();
		readStoredBuilds();
		updateUIShipyardStoredBuilds();
		updateUIFitStoredBuilds();
		updateUIAnalysisStoredBuilds();
		readStoredModules();
		updateUIModulePickerStoredModules();
		updateUIDetailsStoredModules();
		updateUIDetailsStoredModuleControls();
	}; // onStorageEvent()
	
	
	var onLinkEmailClick = function(e) {
		e.preventDefault();
		showUITextPopup('', String.fromCharCode(116,97,108,101,100,101,110,48,64,103,109,97,105,108,46,99,111,109), e.target, false); // just to dissuade any email harvesting bots
	}; // onLinkEmailClick()
	
	
	/*
	* UI INIT
	*/
	
	
	var verifyVersionSync = function() {
		var vH,vC,vD,vJ;
		var dH,dC,dD,dJ;
		try {
			vH = document.getElementById('edsy_versions_html').getAttribute('content').split(',');
			vH = [ parseInt(vH[0]),parseInt(vH[1]),parseInt(vH[2]),parseInt(vH[3]) ];
			dH = parseInt((document.getElementById('last_modified').getAttribute('content') || '0').replace(/-/g,''));
		} catch (e) {
			vH = [ 0,0,0,0 ];
			dH = 0;
		}
		try {
			var compstyle = getComputedStyle(document.documentElement);
			vC = compstyle.getPropertyValue('--edsy-versions-css').trim();
			dC = compstyle.getPropertyValue('--edsy-lastmodified-css').trim();
			if (dC[0] == 'd') {
				vC = vC.split('-');
				vC = [ parseInt(vC[1]),parseInt(vC[2]),parseInt(vC[3]),parseInt(vC[4]) ];
				dC = parseInt(dC.split('-')[1] || 0);
			} else {
				vC = vC.split(',');
				vC = [ parseInt(vC[0]),parseInt(vC[1]),parseInt(vC[2]),parseInt(vC[3]) ];
				dC = parseInt(dC || 0);
			}
		} catch (e) {
			vC = [ 0,0,0,0 ];
			dC = 0;
		}
		try {
			vD = ((eddb || EMPTY_OBJ).edsy_versions_db || EMPTY_ARR);
			vD = [ parseInt(vD[0]),parseInt(vD[1]),parseInt(vD[2]),parseInt(vD[3]) ];
			dD = ((eddb || EMPTY_OBJ).edsy_lastmodified_db || 0);
		} catch (e) {
			vD = [ 0,0,0,0 ];
			dD = 0;
		}
		try {
			vJ = (VERSIONS || EMPTY_ARR);
			vJ = [ parseInt(vJ[0]),parseInt(vJ[1]),parseInt(vJ[2]),parseInt(vJ[3]) ];
			dJ = LASTMODIFIED;
		} catch (e) {
			vJ = [ 0,0,0,0 ];
			dJ = 0;
		}
		
		// fill in the current version and update date
		var v = ('0000000000' + max(vH[0], vC[1], vD[2], vJ[3])).slice(-10);
		document.getElementById('version_label').innerHTML = ('v' + parseInt(v.slice(0,2)) + '.' + parseInt(v.slice(2,4)) + '.' + parseInt(v.slice(4,6)) + (['-','a','b','rc'][parseInt(v.slice(6,8))] || '.') + parseInt(v.slice(8,10)));
		var d = '' + max(dH, dC, dD, dJ) + '00000000';
		document.getElementById('version_label').title = ('updated ' + d.slice(0,4) + '-' + d.slice(4,6) + '-' + d.slice(6,8));
		
		// cross check expected versions
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
	
	
	var initUIEventHandlers = function() {
		window.addEventListener('resize', onWindowResize);
		if (cache.feature.history)
			window.addEventListener('hashchange', onWindowHashChange);
		if (cache.feature.storage)
			window.addEventListener('storage', onStorageEvent);
		document.body.addEventListener('click', onBodyClickCapture, true);
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
		document.getElementById('outfitting_modules_container').addEventListener('dragstart', onUIModulePickerDragStart);
		document.getElementById('outfitting_modules_container').addEventListener('dragend', onUIModulePickerDragEnd);
		document.getElementById('outfitting_modules_container').addEventListener('drop', onUIModulePickerDrop);
		document.getElementById('outfitting_modules_buttons').addEventListener('click', onUIModuleButtonsClick);
		document.getElementById('outfitting_stored_container').addEventListener('click', onUIFitSettingsStoredClick);
		document.getElementById('outfitting_stored_container').addEventListener('change', onUIFitSettingsStoredChange);
		document.getElementById('outfitting_cols_popout').addEventListener('change', onUIFitSettingsColsChange);
		document.getElementById('outfitting_ops_popout').addEventListener('click', onUIFitSettingsOpsClick);
		document.getElementById('outfitting_fit_slots').addEventListener('mousedown', onUIFitSlotsMouseDown);
		document.getElementById('outfitting_fit_slots').addEventListener('change', onUIFitSlotsChange);
		document.getElementById('outfitting_fit_slots').addEventListener('click', onUIFitSlotsClick);
		document.getElementById('outfitting_fit_slots').addEventListener('contextmenu', onUIFitSlotsContextMenu);
		document.getElementById('outfitting_fit_slots').addEventListener('dblclick', onUIFitSlotsDblClick);
		document.getElementById('outfitting_fit_slots').addEventListener('dragstart', onUIFitSlotsDragStart);
		document.getElementById('outfitting_fit_slots').addEventListener('dragend', onUIFitSlotsDragEnd);
		document.getElementById('outfitting_fit_slots').addEventListener('drop', onUIFitSlotsDrop);
		document.forms.fit.elements.export_inara.addEventListener('click', onUIFitExportInaraButtonClick);
		document.getElementById('outfitting_details_settings').addEventListener('change', onUIDetailsSettingsChange);
		document.getElementById('outfitting_details_settings').addEventListener('click', onUIDetailsSettingsClick);
		document.getElementById('outfitting_details_module').addEventListener('change', onUIDetailsModuleChange);
		document.getElementById('engineering_roll').addEventListener('touchstart', onUIDetailsRollTouchStart);
		document.getElementById('engineering_roll').addEventListener('mousedown', onUIDetailsRollMouseDown);
		document.forms.details.elements.blueprint_roll_preset1.addEventListener('click', onUIDetailsRollButtonClick);
		document.forms.details.elements.blueprint_roll_preset2.addEventListener('click', onUIDetailsRollButtonClick);
		document.forms.details.elements.blueprint_roll_preset3.addEventListener('click', onUIDetailsRollButtonClick);
		document.getElementById('outfitting_details_buttons').addEventListener('click', onUIDetailsButtonsClick);
		document.getElementById('outfitting_bottom').addEventListener('change', onUIBottomChange);
		document.forms.stats.elements.stats_cur_fuel.addEventListener('wheel', onUIStatsInputWheel);
		document.forms.stats.elements.stats_cur_fuel.addEventListener('change', onUIStatsInputChange);
		document.forms.stats.elements.stats_cur_cargo.addEventListener('wheel', onUIStatsInputWheel);
		document.forms.stats.elements.stats_cur_cargo.addEventListener('change', onUIStatsInputChange);
		document.getElementById('outfitting_fit_crewdist').addEventListener('click', onUIPowerDistClick);
		document.getElementById('outfitting_fit_powerdist').addEventListener('click', onUIPowerDistClick);
		document.getElementById('analysis_tabs').addEventListener('change', onUIAnalysisTabChange);
		document.getElementById('page_body_options').addEventListener('change', onUIOptionsChange);
		document.getElementById('page_body_options').addEventListener('click', onUIOptionsClick);
		document.getElementById('options_backup').addEventListener('click', onUIOptionsBackupClick);
		document.getElementById('options_restore').addEventListener('click', onUIOptionsRestoreClick);
		document.getElementById('contact_email').addEventListener('click', onLinkEmailClick);
	}; // initUIEventHandlers()
	
	
	var initUIFinal = function() {
		// set initial UI state
		setUIPageTab('shipyard');
		setUIShipyardTab('ships');
		setUIModuleTab('SLOT');
		updateUIFitColumns();
		setUIAnalysisTab('retrofit');
		
		// check for initial import or build hash
		var buffer_storage, buffer_cookie;
		if (buffer_storage = (window.sessionStorage && window.sessionStorage.getItem('edsy_import_buffer'))) {
			window.sessionStorage.removeItem('edsy_import_buffer');
		}
		if (buffer_cookie = getCookie('edsy_import_buffer')) {
			document.cookie = 'edsy_import_buffer=; domain=.edsy.org; path=' + (current.dev ? '/dev' : '/');
			document.cookie = 'edsy_import_buffer=; domain=.edsy.org; path=' + (current.dev ? '/dev' : '/') + '; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT';
		}
		current.hashlock = true;
		setCurrentFit(new Build(1, true), '');
		current.hashlock = false;
		if (buffer_storage && importData(buffer_storage)) {
		} else if (buffer_cookie && importData(buffer_cookie)) {
		} else if (window.location.hash.length > 0 && processURLHash(window.location, true)) {
		}
		setUIOutfittingPanels('slots',  'slots', 'details');
		
		// after all the current content is finished rendering, check the layout
		updateUIFullscreen();
		setTimeout(updateUILayout, 1);
		setTimeout(updateUIStatsPanels, 2);
	}; // initUIFinal()
	
	
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
				window.localStorage.setItem('edsy_localstorage_test', 'edsy_localstorage_test');
				if (window.localStorage.getItem('edsy_localstorage_test') !== 'edsy_localstorage_test')
					throw 'err';
				window.localStorage.removeItem('edsy_localstorage_test');
			} catch (err) {
				cache.feature.storage = false;
			}
		}
		var doc = window.document;
		var docEl = doc.documentElement;
		cache.feature.requestFullscreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
		cache.feature.cancelFullscreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
		
		// process remaining initialization asynchronously so that the loading animation can run
		var steps = [
			// initialize UI
			initUIShipyardShips,
			initUIShipyardStoredBuilds,
			initUIModulePicker,
			initUIFitSlots,
			initUIDetails,
			initUIAnalysisRetrofit,
			initUIOptions,
			
			// initialize storage
			readStoredOptions,
			updateUIOptions,
			readStoredImports,
			readStoredBuilds,
			updateUIShipyardStoredBuilds,
			updateUIAnalysisStoredBuilds,
			readStoredModules,
			updateUIModulePickerStoredModules,
			
			// finalize and launch UI
			initUIEventHandlers,
			initUIFinal,
		];
		var timings = [];
		var init = function() {
			var step = steps.shift();
			var t0 = Date.now();
			step();
			timings.push(step.name+':'+(Date.now()-t0));
			if (steps.length > 0)
				setTimeout(init, 0);
			else if (current.dev)
				console.log(timings.join(',\n'));
		};
		setTimeout(init, 0);
	}; // onDOMContentLoaded()
	
	
	// sniff env and locale
	current.dev = (window.location.protocol === 'file:') || (window.location.pathname.indexOf('/dev/') >= 0);
	current.beta = current.dev || (window.location.pathname.indexOf('/beta/') >= 0);
	current.locale = ((window.navigator.languages || EMPTY_ARR)[0] || window.navigator.userLanguage || window.navigator.language || window.navigator.browserLanguage || window.navigator.systemLanguage || undefined);
	
	// initialize browser features
	cache.feature.history = false;
	cache.feature.file = false;
	cache.feature.storage = false;
	cache.feature.requestFullscreen = false;
	cache.feature.cancelFullscreen = false;
	
	// initialize cache
	initCache();
	
	// if we're in interactive mode, queue the remaining UI init
	if (document.title === 'EDSY') {
		window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
	} else {
		this.Build = Build;
		this.Slot = Slot;
	}
})();
