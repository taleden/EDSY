'use strict';
window.edshipyard = new (function() {
	
	var EMPTY_OBJ = {};
	var EMPTY_ARR = [];
	var GROUPS = ['hardpoint','utility','component','military','internal'];
	var GROUP_LABEL = { hardpoint:'Hardpoints', utility:'Utility Mounts', component:'Core Internal', military:'Military', internal:'Optional Internal' };
	var CORE_SLOT_ABBR = ['BH','PP','TH','FD','LS','PD','SS','FT'];
	var CORE_ABBR_SLOT = { BH:0,PP:1,TH:2,FD:3,LS:4,PD:5,SS:6,FT:7,
	                            RB:1,TM:2,FH:3,EC:4,PC:5,     FS:7 };
	var BOOST_MARGIN = 0.005;
	var SHIP_HATCH_ID = 49180;
	var MAX_SLOT_CLASS = 8;
	var MAX_POWER_DIST = 8;
	var MAX_POWER_PRIORITY = 5;
	var MAX_BLUEPRINT_GRADE = 5;
	var MAX_DAMAGED_PWRCAP = 0.5;
	var HTML_ICON_UNKNOWN = '<span class="icon unknown"></span>';
	var HTML_ICON_MOUNT = { F:'<span class="icon mountFixed"></span>', G:'<span class="icon mountGimballed"></span>', T:'<span class="icon mountTurreted"></span>' };
	var HTML_ICON_MISSILE = { D:'<span class="icon missileDumbfire"></span>', S:'<span class="icon missileSeeking"></span>' };
	
	
	var cache = {
		formatNumText: {},
		formatPctText: {},
		ships: [],
		shipModules: {},
		groupMtypes: {},
		mtypeModules: {},
		mtypeSizeGaps: {},
		mtypeBlueprints: {},
		mtypeExpeffects: {},
		mtypeLimit: {},
	};
	var current = {
		option: {
			onlybest: false,
			experimental: false,
		},
		page: null,
		shipyard_tab: null,
		tab: null,
		fit: null,
		outfitting_focus: null,
		group: null,
		slot: null,
		drag: null,
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
		atanh = (Math.atanh || (function(x) {
			return (log((1 + x) / (1 - x)) / 2);
		})),
		tanh = (Math.tanh || (function(x) {
			var a = exp(+x), b = exp(-x);
			return ((a == Infinity) ? 1 : ((b == Infinity) ? -1 : ((a - b) / (a + b))));
		}))
	;
	var clone = Object.assign || (function(tgt, src) {
		if (src) {
			for (var key in src) {
				if (src.hasOwnProperty(key)) {
					tgt[key] = src[key];
				}
			}
		}
		return tgt;
	});
	var contains = function(lst, itm) {
		var i = lst.length;
		while (i-- > 0) {
			if (lst[i] === itm)
				return true;
		}
		return false;
	};
	
	
	/*
	* UTILITY FUNCTIONS
	*/
	
	
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
	
	
	var formatTimeHTML = function(sec) {
		if (sec !== sec)
			return formatNumHTML(NaN, 1);
		if (!isFinite(sec))
			return formatNumHTML(sec, 0);
		
		var s = (sec % 60);
		var m = (sec / 60) | 0;
		var h = (m / 60) | 0;
		m = (m % 60) | 0;
		
		return ((sec >= 10) ? ((h ? (h.toFixed(0) + ':') : '') + ((h && m < 10) ? '0' : '') + m.toFixed(0) + ':' + (((h || m) && s < 10) ? '0' : '') + s.toFixed(0)) : s.toFixed(1));
	}; // formatTimeHTML()
	
	
	var formatAttrHTML = function(attr, value, dec) {
		var attribute = (eddb.attribute[attr] || EMPTY_OBJ);
		if (dec === undefined)
			dec = (attribute.scale || 0);
		if (attribute.unit === '%')
			return formatPctHTML(value, dec);
		return ((('scale' in attribute) ? formatNumHTML(value, dec) : value) + (attribute.unit ? ('<small>' + attribute.unit + '</small>') : ''));
	}; // formatAttrHTML()
	
	
	var HASH_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-';
	
	
	var hashEncode = function(n, l) {
		var h = '';
		while (n) {
			h = HASH_CHARS[n & 63] + h;
			n = n >> 6;
		}
		while (h.length < l)
			h = HASH_CHARS[0] + h;
		return h;
	}; // hashEncode()
	
	
	var hashDecode = function(h) {
		var n=0, i=0;
		while (i < h.length)
			n = (n << 6) | HASH_CHARS.indexOf(h[i++]);
		return n;
	}; // hashDecode()
	
	
	var hashEncodeS = function(s) {
		var h='', i=0, c;
		for (var i = 0;  i < s.length;  i++) {
			c = s.charCodeAt(i);
			if (c >= 0x20 && c <= 0xFFF) {
				h += HASH_CHARS[c >> 6] + HASH_CHARS[c & 0x3F];
			}
		}
		return h;
	}; // hashEncodeS()
	
	
	var hashDecodeS = function(h) {
		var s='', i=1, c1, c2;
		for (var i = 1;  i < h.length;  i += 2) {
			c1 = HASH_CHARS.indexOf(h[i - 1]);
			c2 = HASH_CHARS.indexOf(h[i]);
			if (c1 >= 0 && c2 >= 0) {
				s += String.fromCharCode((c1 << 6) | c2);
			}
		}
		return s;
	}; // hashDecodeS()
	
	
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
	
	
	var getJumpDistance = function(mass, fuel, fsdOpt, fsdMul, fsdExp) {
		// https://forums.frontier.co.uk/showthread.php?p=643461#post643461
		return pow(fuel / fsdMul, 1 / fsdExp) * fsdOpt / mass;
	}; // getJumpDistance()
	
	
	var getJumpRange = function(fuelcap, mass, fuel, fsdOpt, fsdMul, fsdExp) {
		var range = 0;
		while (fuelcap > fuel) {
			range += getJumpDistance(mass, fuel, fsdOpt, fsdMul, fsdExp);
			fuelcap -= fuel;
			mass -= fuel;
		}
		return range + getJumpDistance(mass, fuelcap, fsdOpt, fsdMul, fsdExp);
	}; // getJumpRange()
	
	
	var getMassCurveMultiplier = function(mass, minMass, optMass, maxMass, minMul, optMul, maxMul) {
		// https://forums.frontier.co.uk/showthread.php/300225-The-One-Formula-To-Rule-Them-All-The-Mechanics-of-Shield-and-Thruster-Mass-Curves
		return (minMul + pow(min(1.0, (maxMass - mass) / (maxMass - minMass)), log((optMul - minMul) / (maxMul - minMul)) / log((maxMass - optMass) / (maxMass - minMass))) * (maxMul - minMul));
	}; // getMassCurveMultiplier()
	
	
	var getEffectiveDamageResistance = function(baseres, extrares) {
		// https://forums.frontier.co.uk/showthread.php/266235-Kinetic-Resistance-Calculation?p=4230114&viewfull=1#post4230114
		// https://forums.frontier.co.uk/showthread.php/286097-Shield-Booster-Mod-Calculator?p=4998592&viewfull=1#post4998592
		var res = 1 - ((1 - baseres) * (1 - extrares));
		var softcap = 1 - ((1 - baseres) * (1 - 0.3));
		return res - max(0, (res - softcap) / 2);
	}; // getEffectiveDamageResistance()
	
	
	var getEffectiveShieldBoostMultiplier = function(shieldbst) {
		// https://forums.frontier.co.uk/showthread.php/314820-(very)-Experimental-shield-change?p=4895068&viewfull=1#post4895068
		var i = (1 + (shieldbst / 100));
	//	i = min(i, (1 - exp(-0.7 * i)) * 2.5); // proposed during 2.3 beta, but not implemented
		return i;
	}; // getEffectiveShieldBoostMultiplier()
	
	
	var getPipDamageResistance = function(sys) {
		// https://forums.frontier.co.uk/showthread.php/341916-2-3-The-Commanders-Changelog
		return 0.6 * pow(sys / MAX_POWER_DIST, 0.85);
	}; // getPipDamageResistance()
	
	
	/*
	We start with the heat dissipation rate function:
		heatdis = heatdismax * pow(heatlevel,2)
	From there it's easy to find the equilibrium heat level by setting dissipation equal to thermal load:
		heatlevel = sqrt(thmload / heatdismax)
	But when we want to model heat level over time, what we actually have is the derivative of the heat curve:
		heatgain / second = -(heatdismax / heatcap) * pow(heatlevel,2) + (thmload / heatcap)
	Which means we have to integrate the first order differential equation of the form:
		dy / dx = -ay^2 + b  ;  ab>0
	
	TODO!
	
	
	Assuming some random intenet integral calculator was correct at https://www.integral-calculator.com/ we get:
		x = -log((ay - sqrt(ab)) / (ay + sqrt(ab))) / (2 * sqrt(ab)) + C
	From which we can derive the constant C based on the initial heat level y at time x = 0:
		C = log((ay - sqrt(ab)) / (ay + sqrt(ab)))
	
	
	Assuming some random internet person did the math right at https://answers.yahoo.com/question/index?qid=20091207184055AALVDeM
	that equation can be integrated to solve for heat level over time:
		y = sqrt(b / -a) * tanh(sqrt(b * -a) * x + C)     ~~  heatlevel = sqrt(thmload / heatdismax) * tanh(sqrt(thmload * heatdismax / pow(heatcap,2)) * seconds + C)
	or for time until heat level:
		x = (atanh(y / sqrt(b / -a)) - C) / sqrt(b * -a)  ~~  seconds = (atanh(heatlevel / sqrt(thmload / heatdismax)) - C) / sqrt(thmload * heatdismax / pow(heatcap,2))
	which also requires, in either case, a constant representing the initial heat level (x=0):
		C = atanh(y / sqrt(b / -a))                       ~~  C = atanh(heatlevel0 / sqrt(thmload / heatdismax))
	*/
	
	
	var getEquilibriumHeatLevel = function(heatdismin, heatdismax, thmload) {
		// https://forums.frontier.co.uk/showthread.php/286628-Research-Detailed-Heat-Mechanics
		// https://forums.frontier.co.uk/showthread.php/286628-Research-Detailed-Heat-Mechanics?p=6399855&viewfull=1#post6399855
		return ((thmload < heatdismin) ? 0 : sqrt(thmload / heatdismax));
	}; // getEquilibriumHeatLevel()
	
	
	var getHeatLevelAtTime = function(heatdismax, thmload, heatlevel0, seconds) {
		return undefined; // TODO
		var sqrt_thmload_heatdismax = sqrt(thmload / heatdismax);
		return (sqrt_thmload_heatdismax * tanh(sqrt(thmload * heatdismax) * seconds + atanh(heatlevel0 / sqrt_thmload_heatdismax)));
	}; // getHeatLevelAtTime()
	
	
	var getTimeUntilHeatLevel = function(heatdismax, thmload, heatlevel0, heatlevel) {
		return 0; // TODO
		var sqrt_thmload_heatdismax = sqrt(thmload / heatdismax);
		return ((atanh(heatlevel / sqrt_thmload_heatdismax) - atanh(heatlevel0 / sqrt_thmload_heatdismax)) / sqrt(thmload * heatdismax));
	}; // getTimeUntilHeatLevel()
	
	
	/*
	* SHIP BUILDS
	*/
	
	
	var Slot = function(build, slotgroup, slotnum, modid) {
		this.build = build;
		this.slotgroup = slotgroup;
		this.slotnum = slotnum;
		this.modid = 0;
		this.module = null;
		this.powered = true;
		this.priority = 1;
		this.bpid = 0;
		this.bpgrade = 0;
		this.expid = 0;
		this.modifier = null;
		if (modid) {
			if (!this.setModuleID(modid))
				throw 'invalid initial module id #' + modid;
		}
	}; // Slot
	Slot.prototype = {
		
		isModuleIDValid: function(modid) {
			if (this.slotgroup === 'ship') return ((this.slotnum === 'hull' && modid === this.build.getShipID()) || (this.slotnum === 'hatch' && modid === SHIP_HATCH_ID)); // ship pseudogroup can only contain hull or cargo hatch
			if (!modid) return (this.slotgroup !== 'component'); // core components cannot be empty
			var module = eddb.module[modid];
			if (!module) return false; // module does not exist
			if (!((this.slotgroup === 'component') ? eddb.group.component[this.slotnum] : eddb.group[this.slotgroup]).mtypes[module.mtype]) return false; // group does not allow the module type
			return true;
		}, // isModuleIDValid()
		
		
		isModuleIDAllowed: function(modid) {
			if (!this.isModuleIDValid(modid)) return false;
			if (this.slotgroup === 'ship' || !modid) return true; // ship pseudogroup slots and empty slots are always allowed if they're valid
			var shipid = this.build.getShipID();
			var ship = eddb.ship[shipid];
			var slotsize = ship.slots[this.slotgroup][this.slotnum];
			var module = eddb.module[modid];
			if (module.class > slotsize) return false; // module is too large for the slot
			if (module.class < slotsize && (module.mtype === 'cls' || module.mtype === 'cs')) return false; // module is too small for the slot (i.e. life support, sensors)
			if (module.reserved && !module.reserved[shipid]) return false; // module does not allow the ship (i.e. fighter hangars, luxury cabins)
			var shipreserved = ((ship.reserved || EMPTY_OBJ)[this.slotgroup] || EMPTY_OBJ)[this.slotnum];
			if (shipreserved && !shipreserved[module.mtype]) return false; // slot does not allow the module type (i.e. Beluga/Orca/Dolphin cabins-only slots)
			return true;
		}, // isModuleIDAllowed()
		
		
		isEnough: function() {
			if (this.slotgroup === 'ship' || !this.modid) return true; // ship pseudogroup slots and empty slots are always enough
			var ship = eddb.ship[this.build.getShipID()];
			if ((this.module.mtype === 'ct' || this.module.mtype === 'isg') && ship.mass > this.getEffectiveAttrValue('maxmass')) return false; // ship mass exceeds thruster/shieldgen maximum
			if (this.module.mtype === 'cpd' && ship.boostcost + BOOST_MARGIN > this.getEffectiveAttrValue('engcap')) return false; // ship boost cost exceeds distributor capacity
			return true;
		}, // isEnough()
		
		
		swapWith: function(slot2) {
			if (!slot2 || (this.prototype !== slot2.prototype) || (this.slotgroup === 'ship') || (slot2.slotgroup === 'ship'))
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
		
		
		getModuleLimitedMtype: function() {
			var module = (this.module || EMPTY_OBJ);
			return ((cache.mtypeLimit[module.mtype] && !module.nosingleton) ? module.mtype : undefined);
		}, // getModuleLimitedMtype()
		
		
		setModuleID: function(modid) {
			if (!(current.option.experimental ? this.isModuleIDValid(modid) : this.isModuleIDAllowed(modid)))
				return false;
			this.modid = (modid || 0);
			this.module =  ((this.slotgroup === 'ship' && this.slotnum === 'hull') ? eddb.ship[modid] : this.build.getModule(modid));
			this.bpid = 0;
			this.bpgrade = 0;
			this.expid = 0;
			this.modifier = null;
			this.build.clearStats();
			return true;
		}, // setModuleID()
		
		
		getPowered: function() {
			return this.powered;
		}, // getPowered()
		
		
		setPowered: function(powered) {
			this.powered = !!powered;
			this.build.clearStats();
			return true;
		}, // setPowered()
		
		
		getPriority: function() {
			return this.priority;
		}, // getPriority()
		
		
		setPriority: function(priority) {
			this.priority = min(max(priority | 0, 1), 5);
			this.build.clearStats();
			return true;
		}, // setPriority()
		
		
		changePriority: function(delta) {
			return this.setPriority(((this.priority + (delta || 1) - 1) % 5) + 1);
		}, // changePriority()
		
		
		getBlueprintID: function() {
			return this.bpid;
		}, // getBlueprintID()
		
		
		setBlueprintID: function(bpid, bpgrade) {
			if (!this.modid || (this.slotgroup === 'ship'))
				return false;
			if (bpid) {
				var blueprint = eddb.blueprint[bpid];
				if (!blueprint)
					return false;
				var mtype = eddb.mtype[this.module.mtype];
				if (!mtype.blueprints || mtype.blueprints.indexOf(bpid) < 0)
					return false;
				if (bpgrade) {
					this.bpgrade = min(max(bpgrade, 1), blueprint.maxgrade);
				} else {
					this.bpgrade = (this.bpid ? ((this.bpgrade / eddb.blueprint[this.bpid].maxgrade * blueprint.maxgrade + 0.5) | 0) : blueprint.maxgrade);
				}
				this.bpid = bpid;
			} else {
				this.bpid = 0;
				this.bpgrade = 0;
			}
			return true;
		}, // setBlueprintID()
		
		
		getBlueprintGrade: function() {
			return this.bpgrade;
		}, // getBlueprintGrade()
		
		
		setBlueprintGrade: function(bpgrade) {
			if (!this.modid || !this.bpid)
				return false;
			this.bpgrade = min(max(bpgrade, 1), eddb.blueprint[this.bpid].maxgrade);
			return true;
		}, // setBlueprintGrade()
		
		
		getExpeffectID: function() {
			return this.expid;
		}, // getExpeffectID()
		
		
		setExpeffectID: function(expid) {
			if (!this.modid || (this.slotgroup === 'ship'))
				return false;
			if (expid) {
				if (!eddb.expeffect[expid])
					return false;
				var mtype = eddb.mtype[this.module.mtype];
				if (!mtype.expeffects || mtype.expeffects.indexOf(expid) < 0)
					return false;
				this.expid = expid;
			} else {
				this.expid = 0;
			}
			this.build.clearStats();
			return true;
		}, // setExpeffectID()
		
		
		isModifiable: function() {
			return !!(this.modid && (this.slotgroup !== 'ship') && eddb.mtype[this.module.mtype].modifiable);
		}, // isModifiable()
		
		
		isModified: function() {
			return !!(this.modifier || this.expid);
		}, // isModified()
		
		
		getRelatedAttrModifier: function(attr) {
			switch (attr) {
			case 'rof':
				var rofBase = getModuleAttrValue(this.module, 'rof');
				if (!this.module || !isFinite(rofBase))
					return 0;
				var bstsize = this.getEffectiveAttrValue('bstsize');
				var bstrof = this.getEffectiveAttrValue('bstrof') || 1;
				var bstint = this.getEffectiveAttrValue('bstint');
				return (((bstsize / (((bstsize - 1) / bstrof) + bstint)) / rofBase) - 1);
				
			case 'dps':
				return getAttrModifierSum(attr,
					getAttrModifierSum(attr,
						this.getEffectiveAttrModifier('damage'),
						this.getEffectiveAttrModifier('rof')
					),
					this.getEffectiveAttrModifier('rounds')
				);
				
			case 'shotspd':
				return max(0, this.getEffectiveAttrModifier('maxrng'));
				
			case 'minmass':
			case 'maxmass':
				return this.getEffectiveAttrModifier('optmass');
				
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
			// get related and experimental modifiers
			var modRel = ((attr === 'rof') ? 0 : this.getRelatedAttrModifier(attr));
			var modExp = ((eddb.expeffect[this.expid] || EMPTY_OBJ)[attr] || 0);
			if (modExp) {
				var attribute = eddb.attribute[attr];
				modExp /= ((attribute.modset || attribute.modadd) ? 1 : (attribute.modmod || 100));
			}
			
			// set the base modifier
			var basemodifier = getAttrModifierDifference(attr, modifier, getAttrModifierSum(attr, modExp, modRel));
			return this.setAttrModifier(attr, basemodifier);
		}, // setEffectiveAttrModifier()
		
		
		setAttrModifier: function(attr, modifier) {
			if ((this.slotgroup === 'ship') || !this.module)
				return false;
			if (attr === 'rof') {
				attr = 'bstint';
				var bstsize = this.getEffectiveAttrValue('bstsize');
				var bstrof = this.getEffectiveAttrValue('bstrof');
				if (bstsize > 1 && bstrof > 0) {
					var rof = getModuleAttrValue(this.module, 'rof', modifier);
					var bstint = getModuleAttrValue(this.module, 'bstint');
					modifier = ((((bstsize / rof) - ((bstsize - 1) / bstrof)) / bstint) - 1);
				} else {
					modifier = ((1 / (1 + modifier)) - 1);
				}
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
				}
			} else {
				if (!isModuleAttrModifiable(this.module, attr))
					return false;
				if (!this.modifier)
					this.modifier = {};
				this.modifier[attr] = getModuleAttrModifier(this.module, attr, getModuleAttrValue(this.module, attr, modifier));
			}
			this.build.clearStats();
			return true;
		}, // setAttrModifier()
		
		
		setAttrModifiersForBlueprint: function(roll) {
			if ((this.slotgroup === 'ship') || !this.module)
				return false;
			var modifiable = (eddb.mtype[this.getModuleMtype()] || EMPTY_OBJ).modifiable;
			var blueprint = eddb.blueprint[this.bpid];
			if (!modifiable || !blueprint || this.bpgrade < 1 || this.bpgrade > blueprint.maxgrade)
				return false;
			roll = min(max(roll, 0), 1);
			this.modifier = {};
			for (var a = 0;  a < modifiable.length;  a++) {
				var attr = modifiable[a];
				var attribute = eddb.attribute[attr];
				if (attribute && blueprint[attr]) {
					var himod = blueprint[attr][this.bpgrade - 1];
					var lomod = ((this.bpgrade > 1) ? blueprint[attr][this.bpgrade - 2] : (himod ? (himod - (blueprint[attr][1] - himod)) : 0));
					this.modifier[attr] = (((himod < 0) === !attribute.bad) ? himod : (lomod + roll * (himod - lomod))) / (attribute.modmod || ((attribute.modadd || attribute.modset) ? 1 : 100));
				}
			}
			// when modifying clip size, round up to a multiple of burst size
			if (this.modifier['ammoclip']) {
				var ammoclip = getModuleAttrValue(this.module, 'ammoclip') * (1 + this.modifier['ammoclip']);
				this.modifier['ammoclip'] = getModuleAttrModifier(this.module, 'ammoclip', ceil(ammoclip / this.modifier['bstsize']) * this.modifier['bstsize']);
			}
			// when modifying damage falloff, cap at maximum range
			if (this.modifier['dmgfall']) {
				var maxrng = getModuleAttrValue(this.module, 'maxrng', this.modifier['maxrng']);
				var dmgfall = getModuleAttrValue(this.module, 'dmgfall', this.modifier['dmgfall']);
				this.modifier['dmgfall'] = getModuleAttrModifier(this.module, 'dmgfall', min(maxrng, dmgfall));
			}
			this.build.clearStats();
			return true;
		}, // setAttrModifiersForBlueprint()
		
		
		getHash: function() {
			if (!this.module)
				return '';
			if (this.slotgroup === 'ship' && this.slotnum === 'hull') {
				return ''; // TODO
			}
			var mtype = (eddb.mtype[this.getModuleMtype()] || EMPTY_OBJ);
			var hash = '';
			var mods = 0;
			if (mtype.modifiable && this.modifier) {
				for (var a = 0;  a < mtype.modifiable.length;  a++) {
					var attr = mtype.modifiable[a];
					if (eddb.attribute[attr] && this.modifier[attr]) {
						mods++;
						hash += hashEncode(((a & 0xF) << 20) | (float20Encode(this.modifier[attr]) & 0xFFFFF), 4);
					}
				}
			}
			var bpidx = ((mtype.blueprints || EMPTY_ARR).indexOf(this.bpid) + 1);
			var expidx = ((mtype.expeffects || EMPTY_ARR).indexOf(this.expid) + 1);
			var modbits = (((bpidx & 0x1F) << 13) | ((this.bpgrade & 0x7) << 10) | ((expidx & 0x1F) << 5) | (mods & 0x1F));
			var slotbits = (modbits ? 0x10 : 0) | (this.powered ? 0 : 0x8) | ((this.priority - 1) & 0x7);
			return hashEncode(this.modid & 0x1FFFF, 3) + hashEncode(slotbits, 1) + (modbits ? (hashEncode(modbits, 3) + hash) : '');
		}, // getHash()
		
		
		HASH_IDMAP: {
			blueprint : {
				hardpoint : ['wpn_ds','wpn_eff','wpn_foc','wpn_hc','wpn_lw','wpn_lr','wpn_oc','wpn_rf','wpn_sr','wpn_stu'],
				utility : [null,'misc_lw','misc_rf','misc_sh','scan_lr','scan_wa','scan_fs'],
				ucl : ['ucl_ammo','misc_lw','misc_rf','misc_sh'],
				uhsl : ['uhsl_ammo','misc_lw','misc_rf','misc_sh'],
				upd : ['upd_ammo','misc_lw','misc_rf','misc_sh'],
				usb : ['usb_br','usb_hd','usb_kr','usb_ra','usb_tr'],
				cls : [null,'misc_lw4','misc_rf4','misc_sh4'],
				cs : [null,'cs_lw',null,null,'cs_lr','cs_wa'],
				iafmu : [null,null,null,'misc_sh4'],
				iclc : [null,'misc_lw','misc_rf','misc_sh'],
				ifs : [null,null,null,'misc_sh4'],
				iftlc : [null,'misc_lw','misc_rf','misc_sh'],
				ihblc : [null,'misc_lw','misc_rf','misc_sh'],
				iplc : [null,'misc_lw','misc_rf','misc_sh'],
				ir : [null,null,null,'misc_sh4'],
				iss : [null,null,null,null,'iss_lr','iss_wa','iss_fs'],
			},
		},
		
		
		setHash: function(hash, version, idmap) {
			if (this.slotgroup === 'ship' && this.slotnum === 'hull') {
				return false; // TODO
			}
			var i = 0;
			
			// module id
			var modid = hashDecode(hash.slice(i, (i += ((version < 9 && this.slotgroup === 'component') ? 2 : 3))));
			if (this.slotgroup === 'hardpoint') {
				modid = idmap.hardpoint[modid] || idmap.utility[modid] || modid;
			} else if (this.slotgroup === 'component') {
				modid = idmap.component[this.slotnum][modid] || modid;
			} else {
				modid = idmap[this.slotgroup][modid] || modid;
			}
			modid = (idmap.module[modid] || modid) & 0x1FFFF;
			if (!this.setModuleID(modid))
				return false;
			
			// modified, powered and priority
			var slotbits = ((version < 8) ? 0 : hashDecode(hash.slice(i, (i += 1))));
			var modified = (slotbits & 0x10);
			var powered = !(slotbits & 0x8);
			var priority = (slotbits & 0x7) + 1;
			if (!this.setPowered(powered) || !this.setPriority(priority))
				return false;
			
			// modification data
			var mtypeid = this.getModuleMtype();
			var mtype = (eddb.mtype[mtypeid] || EMPTY_OBJ);
			if (mtype.modifiable && modified) {
				var modbits = ((version < 9) ? 0 : hashDecode(hash.slice(i, (i += ((version < 12) ? 2 : 3)))));
				
				// blueprint and grade
				if (version < 12) {
					var bpidx = ((modbits >> 6) & 0x3F);
					var bpid = (bpidx ? (idmap.blueprint[mtypeid] || idmap.blueprint[this.slotgroup] || mtype.blueprints || EMPTY_ARR)[((bpidx % 10 + 0.5) | 0)] : 0);
					var bpgrade = ((bpidx / 10 + 0.5) | 0);
				} else {
					var bpidx = ((modbits >> 13) & 0x1F);
					var bpid = (mtype.blueprints || EMPTY_ARR)[bpidx - 1];
					var bpgrade = ((modbits >> 10) & 0x7);
				}
				if (!this.setBlueprintID(bpid, bpgrade))
					return false;
				
				// expeffect
				var expidx = ((version < 12) ? 0 : ((modbits >> 5) & 0x1F));
				var expid = (mtype.expeffects || EMPTY_ARR)[expidx - 1];
				if (!this.setExpeffectID(expid))
					return false;
				
				// attr mods
				var v9rof = 0;
				var mods = ((version < 12) ? (modbits & 0x3F) : (modbits & 0x1F));
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
							} else if (attr === 'thmres' || attr === 'kinres' || attr === 'expres') {
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
						if (!this.setAttrModifier(attr, modifier))
							return false;
					}
				}
				if (v9rof) {
					if (!this.setAttrModifier('rof', v9rof))
						return false;
				}
			}
			
			this.build.clearStats();
			return true;
		}, // setHash()
		
	}; // Slot.prototype
	
	
	var Build = function(shipid, stock) {
		var ship = eddb.ship[shipid];
		if (!ship)
			throw 'invalid ship id #' + shipid;
		this.stats = null;
		this.shipid = shipid;
		this.dist = { sys:4, eng:4, wep:4 };
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
				this.slots[slotgroup].push(new Slot(this, slotgroup, slotnum, modid));
			}
		}
	}; // Build
	Build.prototype = {
		
		getShipID: function() {
			return this.shipid;
		}, // getShipID()
		
		
		getModule: function(modid) {
			return (cache.shipModules[this.shipid][modid] || eddb.module[modid]);
		}, // getModule()
		
		
		getPowerDist: function(dist) {
			if (dist)
				return this.dist[dist];
			return { sys:this.dist.sys, eng:this.dist.eng, wep:this.dist.wep };
		}, // getPowerDist()
		
		
		setPowerDist: function(sys, eng, wep) {
			this.dist.sys = sys = min(max(sys | 0, 0                             ), MAX_POWER_DIST);
			this.dist.eng = eng = min(max(eng | 0, 0, (12 - MAX_POWER_DIST) - sys), MAX_POWER_DIST, 12 - sys);
			this.dist.wep = 12 - sys - eng;
			this.clearStats();
			return true;
		}, // setPowerDist()
		
		
		changePowerDist: function(to, delta) {
			if (!(to in this.dist))
				return false;
			if (!delta)
				return this.setPowerDist(this.dist.sys, this.dist.eng, this.dist.wep);
			var f1 = ((to === 'sys') ? 'eng' : 'sys');
			var f2 = ((to === 'wep') ? 'eng' : 'wep');
			if (delta < 0) {
				delta = min(-delta, this.dist[to]);
				var f1d = min(delta >> 1, MAX_POWER_DIST - this.dist[f1]);
				var f2d = min(delta >> 1, MAX_POWER_DIST - this.dist[f2]);
				var rd = delta - f1d - f2d;
				if (this.dist[f2] < this.dist[f1]) {
					f2d += rd;
				} else {
					f1d += rd;
				}
				this.dist[to] -= delta;
				this.dist[f1] += f1d;
				this.dist[f2] += f2d;
			} else if (delta > 0) {
				delta = min(delta, MAX_POWER_DIST - this.dist[to]);
				var f1d = min(delta >> 1, this.dist[f1]);
				var f2d = min(delta >> 1, this.dist[f2]);
				var rd = delta - f1d - f2d;
				if (this.dist[f2] > this.dist[f1]) {
					f2d += rd;
				} else {
					f1d += rd;
				}
				this.dist[to] += delta;
				this.dist[f1] -= f1d;
				this.dist[f2] -= f2d;
			}
			this.clearStats();
			return true;
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
			if ((slotgroup1 === 'component' && slotnum1 === CORE_ABBR_SLOT.FT) || (slotgroup2 === 'component' && slotnum2 === CORE_ABBR_SLOT.FT))
				this.clearStats();
			return true;
		}, // swapSlots()
		
		
		getSlot: function(slotgroup, slotnum) {
			return (this.slots[slotgroup] || EMPTY_OBJ)[slotnum];
		}, // getSlot()
		
		
		getLimitedMtypeTotals: function() {
			var mtypeTotal = {};
			for (var slotgroup in this.slots) {
				if (slotgroup !== 'ship') {
					var slot;
					for (var slotnum = 0;  slot = this.getSlot(slotgroup, slotnum);  slotnum++) {
						var mtype = slot.getModuleLimitedMtype();
						if (mtype) {
							mtypeTotal[mtype] = (mtypeTotal[mtype] || 0) + 1;
						}
					}
				}
			}
			return mtypeTotal;
		}, // getLimitedMtypeTotals()
		
		
		clearStats: function() {
			this.stats = null;
		}, // clearStats()
		
		
		updateStats: function() {
			var stats = this.stats = {
				cost: 0,
				mass: 0,
				pwrcap: 0,
				pwrdraw_dep: [0,0,0,0,0,0],
				pwrdraw_ret: [0,0,0,0,0,0],
				thmload_pwrdraw: 0,
				thmload_ct: 0,
				thmload_cfsd: 0,
				thmload_hardpoint: 0,
				thmload_iscb: 0,
				duration_iscb: 0,
				fuelcap: 0, 
				cargocap: 0,
				cabincap: 0,
				scooprate: 0,
				hullbst: 0,
				hullrnf: 0,
				shieldbst: 0,
				shieldrnf: 0,
				thmmod_ihrp: 1,
				kinmod_ihrp: 1,
				expmod_ihrp: 1,
				thmmod_usb: 1,
				kinmod_usb: 1,
				expmod_usb: 1,
				integ_imrp: 0,
				dmgprot: 1,
				distdraw_second: 0,
				dps_distdraw: 0,
				dps_nodistdraw: 0,
				dps_abs: 0,
				dps_thm: 0,
				dps_kin: 0,
				dps_exp: 0,
				dps_axe: 0,
			};
			
			// ship hull
			var slot = this.getSlot('ship', 'hull');
			stats.cost += slot.getEffectiveAttrValue('cost');
			stats.mass += slot.getEffectiveAttrValue('mass');
			
			// cargo hatch
			slot = this.getSlot('ship', 'hatch');
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
			for (var slotgroup in GROUP_LABEL) {
				for (var slotnum = 0;  slot = this.getSlot(slotgroup, slotnum);  slotnum++) {
					if (module = slot.getModule()) {
						var mtypeid = slot.getModuleMtype();
						stats.cost += slot.getEffectiveAttrValue('cost');
						stats.mass += slot.getEffectiveAttrValue('mass');
						stats.pwrcap += slot.getEffectiveAttrValue('pwrcap');
						stats.fuelcap += slot.getEffectiveAttrValue('fuelcap');
						stats.cargocap += slot.getEffectiveAttrValue('cargocap');
						stats.cabincap += slot.getEffectiveAttrValue('cabincap');
						stats.hullbst += slot.getEffectiveAttrValue('hullbst');
						stats.hullrnf += slot.getEffectiveAttrValue('hullrnf');
						
						var pwrdraw = slot.getEffectiveAttrValue('pwrdraw');
						if (!pwrdraw || slot.getPowered()) {
							var priority = slot.getPriority();
							stats.pwrdraw_dep[0] += pwrdraw;
							stats.pwrdraw_dep[priority] += pwrdraw;
							if (slotgroup !== 'hardpoint' && ((slotgroup !== 'utility') || module.passive)) {
								stats.pwrdraw_ret[0] += pwrdraw;
								stats.pwrdraw_ret[priority] += pwrdraw;
							}
							
							stats.scooprate += slot.getEffectiveAttrValue('scooprate');
							stats.shieldbst += slot.getEffectiveAttrValue('shieldbst');
							
							stats.thmload_pwrdraw += pwrdraw;
							var thmload = slot.getEffectiveAttrValue('thmload');
							if (mtypeid === 'ct') {
								stats.thmload_ct += thmload;
							} else if (mtypeid === 'cfsd') {
								stats.thmload_cfsd += thmload;
							} else if (slotgroup === 'hardpoint') {
								stats.thmload_hardpoint += thmload;
							} else if (mtypeid === 'iscb') {
								var duration = slot.getEffectiveAttrValue('duration');
								stats.thmload_iscb += thmload / duration;
								stats.duration_iscb = max(stats.duration_iscb, duration);
							}
							
							if (slotgroup === 'hardpoint') {
								var rof = slot.getEffectiveAttrValue('rof');
								var ammoclip = slot.getEffectiveAttrValue('ammoclip');
								var ammomax = slot.getEffectiveAttrValue('ammomax');
								var rldtime = slot.getEffectiveAttrValue('rldtime');
								var distdraw = slot.getEffectiveAttrValue('distdraw');
								var cycletime = isFinite(rof) ? (rldtime ? (((ammoclip || 1) - 1) / rof + rldtime) : ((ammoclip || 1) / rof)) : 1;
								var ammotime = cycletime - rldtime + (ammoclip ? (cycletime * ammomax / ammoclip) : 1/0);
								var dps = slot.getEffectiveAttrValue('damage') * slot.getEffectiveAttrValue('rounds') * (ammoclip || 1) / cycletime;
								if (distdraw) {
									stats.distdraw_second += distdraw * (ammoclip || 1) / cycletime;
									stats.dps_distdraw += dps;
								} else {
									stats.dps_nodistdraw += dps;
								}
								stats.dps_abs += dps * (slot.getEffectiveAttrValue('abswgt') || 0);
								stats.dps_thm += dps * (slot.getEffectiveAttrValue('thmwgt') || 0);
								stats.dps_kin += dps * (slot.getEffectiveAttrValue('kinwgt') || 0);
								stats.dps_exp += dps * (slot.getEffectiveAttrValue('expwgt') || 0);
								stats.dps_axe += dps * (slot.getEffectiveAttrValue('axewgt') || 0);
							} else if (module.mtype === 'usb') {
								stats.thmmod_usb *= (1 - (slot.getEffectiveAttrValue('thmres') / 100));
								stats.kinmod_usb *= (1 - (slot.getEffectiveAttrValue('kinres') / 100));
								stats.expmod_usb *= (1 - (slot.getEffectiveAttrValue('expres') / 100));
							} else if (module.mtype === 'iscb') {
								stats.shieldrnf += slot.getEffectiveAttrValue('duration') * slot.getEffectiveAttrValue('shieldrnf') * (slot.getEffectiveAttrValue('ammoclip') + slot.getEffectiveAttrValue('ammomax'));
							}
						}
						if (mtypeid === 'imrp') {
							stats.integ_imrp += slot.getEffectiveAttrValue('integ');
							stats.dmgprot *= (1 - (slot.getEffectiveAttrValue('dmgprot') / 100));
						} else if (mtypeid === 'ihrp') {
							stats.thmmod_ihrp *= (1 - (slot.getEffectiveAttrValue('thmres') / 100));
							stats.kinmod_ihrp *= (1 - (slot.getEffectiveAttrValue('kinres') / 100));
							stats.expmod_ihrp *= (1 - (slot.getEffectiveAttrValue('expres') / 100));
						}
					}
				}
			}
		}, // updateStats()
		
		
		getStat: function(stat) {
			if (!this.stats)
				this.updateStats();
			return this.stats[stat];
		}, // getStat()
		
	}; // Build.prototype
	
	
	/*
	* MODULES & ATTRIBUTES
	*/
	
	
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
	
	
	var getModuleLabel = function(module, brief, icons) {
		return (
			'' + module.class + module.rating +
			((module.mount || module.missile || module.cabincls) ? (
				'/' +
				(module.mount   ? (icons ? (HTML_ICON_MOUNT[  module.mount  ] || HTML_ICON_UNKNOWN) : module.mount  ) : '') +
				(module.missile ? (icons ? (HTML_ICON_MISSILE[module.missile] || HTML_ICON_UNKNOWN) : module.missile) : '') +
				(module.cabincls || '')
			) : '') +
			(brief ? '' : (' ' + module.name))
		);
	}; // getModuleLabel()
	
	
	var getModuleAttrs = function(module) {
		var attrflag = {};
		for (var attr in module) {
			if (eddb.attribute[attr])
				attrflag[attr] = 1;
		}
		var modifiable = ((eddb.mtype[module.mtype] || EMPTY_OBJ).modifiable || EMPTY_ARR);
		for (var a = 0;  a < modifiable.length;  a++) {
			if (eddb.attribute[modifiable[a]])
				attrflag[modifiable[a]] = 1;
		}
		if (attrflag.damage)
			attrflag.dps = 1;
		if (attrflag.bstrof || attrflag.bstsize || attrflag.bstint)
			attrflag.rof = 1;
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
			
		case 'dps':
			var damage = getModuleAttrValue(module, 'damage');
			var rof = getModuleAttrValue(module, 'rof');
			var rounds = getModuleAttrValue(module, 'rounds');
			value = (damage * (isFinite(rof) ? rof : 1) * rounds);
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
			// fall back on default attribute value
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
		var v1 = eddb.mtype[mtype1].name;
		var v2 = eddb.mtype[mtype2].name;
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
		v1 = 0 + !(eddb.mtype[m1.mtype].modulenames[m1.name]);
		v2 = 0 + !(eddb.mtype[m2.mtype].modulenames[m2.name]);
		if (v1 != v2) return v1 - v2;
		// if same-name, by mount type (F-G-T)
		if (m1.name == m2.name) {
			v1 = 0 + (m1.mount || ' ').charCodeAt(0);
			v2 = 0 + (m2.mount || ' ').charCodeAt(0);
			if (v1 != v2) return v1 - v2;
		}
		// if non-unique, ...
		if (eddb.mtype[m1.mtype].modulenames[m1.name]) {
			// by missile type (D-S)
			v1 = 0 + (m1.missile || ' ').charCodeAt(0);
			v2 = 0 + (m2.missile || ' ').charCodeAt(0);
			if (v1 != v2) return v1 - v2;
			// by passenger cabin class (E-B-F-L)
			v1 = 0 + (((m1.cabincls == 'E') ? 'A' : m1.cabincls) || ' ').charCodeAt(0);
			v2 = 0 + (((m2.cabincls == 'E') ? 'A' : m2.cabincls) || ' ').charCodeAt(0);
			if (v1 != v2) return v1 - v2;
		}
		// by rating (A-B-C-D-E-F-G-H-I)
		v1 = 0 - (m1.rating || ' ').charCodeAt(0);
		v2 = 0 - (m2.rating || ' ').charCodeAt(0);
		if (v1 != v2) return v1 - v2;
		/*
		// by cost, descending
		v1 = 0 - (m1.cost || 0);
		v2 = 0 - (m2.cost || 0);
		if (v1 != v2) return v1 - v2;
		*/
		// by name
		return (m1.name < m2.name) ? -1 : ((m1.name > m2.name) ? 1 : 0);
	}; // sortModules()
	
	
	var sortBlueprints = function(bpid1, bpid2) {
		var v1 = eddb.blueprint[bpid1].name;
		var v2 = eddb.blueprint[bpid2].name;
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortBlueprints()
	
	
	var sortExpeffects = function(expid1, expid2) {
		var v1 = eddb.expeffect[expid1].name;
		var v2 = eddb.expeffect[expid2].name;
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortExpeffects()
	
	
	var initCache = function() {
		// identify and sort ships
		cache.ships = Object.keys(eddb.ship);
		cache.ships.sort(sortShipIDs);
		
		// fill in ship-specific module attributes
		cache.shipModules = {};
		for (var shipid in eddb.ship) {
			var ship = eddb.ship[shipid];
			cache.shipModules[shipid] = {};
			for (var modid in (ship.module || EMPTY_OBJ)) {
				cache.shipModules[shipid][modid] = clone(clone({}, eddb.module[modid]), ship.module[modid]);
			}
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
		
		// identify and sort modules for each mtype
		for (var modid in eddb.module) {
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
		
		// identify and sort blueprints and expeffects for each mtype
		cache.mtypeBlueprints = {};
		cache.mtypeExpeffects = {};
		for (var mtype in cache.mtypeModules) {
			if (eddb.mtype[mtype].blueprints) {
				cache.mtypeBlueprints[mtype] = eddb.mtype[mtype].blueprints.slice(0);
				cache.mtypeBlueprints[mtype].sort(sortBlueprints);
			}
			if (eddb.mtype[mtype].expeffects) {
				cache.mtypeExpeffects[mtype] = eddb.mtype[mtype].expeffects.slice(0);
				cache.mtypeExpeffects[mtype].sort(sortExpeffects);
			}
		}
		
		// identify mtype limits
		cache.mtypeLimit = {};
		for (var mtype in eddb.mtype) {
			if (eddb.mtype[mtype].singleton) {
				cache.mtypeLimit[mtype] = eddb.mtype[mtype].singleton;
			}
		}
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
	}; // updateUIOptions()
	
	
	var setUIPageTab = function(tab) {
		current.page = tab;
		document.forms.header.elements.tab.value = tab;
		document.getElementById('page_body').className = tab;
	}; // setUIPageTab()
	
	
	var setDOMSelectLength = function(select, length) {
		while (select.length < length)
			select.options.add(document.createElement('option'));
		while (select.length > length)
			select.options.remove(select.options.length - 1);
	}; // setDOMSelectLength()
	
	
	var setCurrentDrag = function(modid, fromgroup, fromslot) {
		current.drag = (modid ? { id:modid, group:fromgroup, slot:fromslot } : null);
		if (modid && fromgroup) {
			document.getElementById('outfitting_modules_container').addEventListener('dragenter', onUIModulePickerDragEnter);
			document.getElementById('outfitting_modules_container').addEventListener('dragover', onUIModulePickerDragOver);
			document.getElementById('outfitting_modules_container').addEventListener('dragleave', onUIModulePickerDragLeave);
		} else {
			document.getElementById('outfitting_modules_container').removeEventListener('dragenter', onUIModulePickerDragEnter);
			document.getElementById('outfitting_modules_container').removeEventListener('dragover', onUIModulePickerDragOver);
			document.getElementById('outfitting_modules_container').removeEventListener('dragleave', onUIModulePickerDragLeave);
		}
		document.getElementById('outfitting_fit_ship_hull').className = (modid ? 'dragerror' : '');
		document.getElementById('outfitting_fit_ship_hatch').className = (modid ? 'dragerror' : '');
		for (var slotgroup in GROUP_LABEL) {
			var slot;
			for (var slotnum = 0;  slot = current.fit.getSlot(slotgroup, slotnum);  slotnum++) {
				var tr = document.getElementById('outfitting_fit_slot_' + slotgroup + '_' + slotnum);
				// TODO: flag slots restricted by module limits
				if (!modid) {
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
	* SHIPYARD UI
	*/
	
	
	var initUIShipyard = function() {
		var attrs = [
			'name', 'retail', 'szcls', 'crew', 'masslock', 'mass', 'topspd', 'bstspd', 'shields', 'armour', 'hardness', '_cargo', '_passengers',
			'_hardpoint', '_utility', '_component_0','_component_1','_component_2','_component_3','_component_4','_component_5','_component_6','_component_7', '_military', '_internal'
		];
		
		var attrAbbr = {
			name: 'Ship',
			retail: 'Price',
			szcls: 'Sz',
			crew: 'Crw',
			masslock: 'MLF',
			mass: 'Mass',
			topspd: 'Spd',
			bstspd: 'Bst',
			shields: 'Shd',
			armour: 'Arm',
			hardness: 'Hrd',
			_cargo: 'Crgo',
			_passengers: 'Psgr',
			_hardpoint: 'Hardpoints',
			_utility: 'Utl',
			_component_0: CORE_SLOT_ABBR[0],
			_component_1: CORE_SLOT_ABBR[1],
			_component_2: CORE_SLOT_ABBR[2],
			_component_3: CORE_SLOT_ABBR[3],
			_component_4: CORE_SLOT_ABBR[4],
			_component_5: CORE_SLOT_ABBR[5],
			_component_6: CORE_SLOT_ABBR[6],
			_component_7: CORE_SLOT_ABBR[7],
			_military: 'Mil',
			_internal: 'Opt Internal',
		};
		
		var attrAlign = {
			name: 'tal',
			szcls: 'tac',
			_hardpoint: 'tal',
			_utility: 'tac',
			_component_0: 'tac',
			_component_1: 'tac',
			_component_2: 'tac',
			_component_3: 'tac',
			_component_4: 'tac',
			_component_5: 'tac',
			_component_6: 'tac',
			_component_7: 'tac',
			_military: 'tal',
			_internal: 'tal',
		};
		
		var attrRender = {
			szcls: function(ship) { return '?SML'[ship.class || 0]; },
			_cargo: function(ship) { return ''; }, // TODO
			_passengers: function(ship) { return ''; }, // TODO
			_hardpoint: function(ship) {
				var sizes = ship.slots.hardpoint.slice(0);
				sizes.sort(sortNumbersDesc);
				var i = sizes.length;
				while (i-- > 0) {
					sizes[i] = '?SMLH'[sizes[i] || 0];
				}
				return sizes.join(' ');
			},
			_utility: function(ship) { return ship.slots.utility.length; },
			_component_0: function(ship) { return ship.slots.component[0]; },
			_component_1: function(ship) { return ship.slots.component[1]; },
			_component_2: function(ship) { return ship.slots.component[2]; },
			_component_3: function(ship) { return ship.slots.component[3]; },
			_component_4: function(ship) { return ship.slots.component[4]; },
			_component_5: function(ship) { return ship.slots.component[5]; },
			_component_6: function(ship) { return ship.slots.component[6]; },
			_component_7: function(ship) { return ship.slots.component[7]; },
			_military: function(ship) {
				var sizes = ship.slots.military.slice(0);
				sizes.sort(sortNumbersDesc);
				return sizes.join(' ');
			},
			_internal: function(ship) {
				var sizes = ship.slots.internal.slice(0);
				sizes.sort(sortNumbersDesc);
				return sizes.join(' ');
			},
		};
		
		var table = document.createElement('table');
		table.id = 'shipyard_table';
		
		var thead = document.createElement('thead');
		var tr = document.createElement('tr');
		for (var a = 0;  a < attrs.length;  a++) {
			var attr = attrs[a];
			var th = document.createElement('th');
			th.className = attrAlign[attr] || 'tar';
			var abbr = document.createElement('abbr');
			abbr.innerHTML = attrAbbr[attr];
			th.appendChild(abbr);
			tr.appendChild(th);
		}
		thead.appendChild(tr);
		table.appendChild(thead);
		
		var tbody = document.createElement('tbody');
		for (var s = 0;  s < cache.ships.length;  s++) {
			var shipid = cache.ships[s];
			var ship = eddb.ship[shipid];
			var tr = document.createElement('tr');
			tr.id = 'shipyard_ship_' + shipid;
			for (var a = 0;  a < attrs.length;  a++) {
				var attr = attrs[a];
				var td = document.createElement('td');
				td.className = attrAlign[attr] || 'tar';
				td.innerHTML = attrRender[attr] ? attrRender[attr](ship) : ship[attr];
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		
		document.getElementById('shipyard_container').appendChild(table);
	}; // initUIShipyard()
	
	
	var setUIShipyardTab = function(tab) {
		current.shipyard_tab = tab;
		document.forms.shipyard.elements.tab.value = tab;
		document.forms.shipyard.className = tab;
	}; // setUIShipyardTab()
	
	
	/*
	* PICKER UI
	*/
	
	
	var initUIModulePicker = function() {
		// build picker DOM
		var divPicker = document.createElement('div');
		divPicker.id = 'outfitting_modules_picker';
		for (var g = 0;  g < GROUPS.length;  g++) {
			var group = GROUPS[g];
			if (!cache.groupMtypes[group] || cache.groupMtypes[group].length < 1)
				continue;
			var fakeGroupStored = false && (Math.random() < 0.66); // TODO
			
			var divGroup = document.createElement('div');
			divGroup.id = 'outfitting_modules_group_' + group;
			divGroup.className = 'group ' + group + (fakeGroupStored ? ' stored' : ''); // TODO
			var header = document.createElement('header');
			header.innerHTML = GROUP_LABEL[GROUPS[g]];
			divGroup.appendChild(header);
			
			for (var t = 0;  t < cache.groupMtypes[group].length;  t++) {
				var mtype = cache.groupMtypes[group][t];
				var fakeTypeStored = fakeGroupStored && (Math.random() < 0.5); // TODO
				
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
					// close the running row when the size class changes or if the previous or current module is unique
					if (divRow && (!module || moduleSize !== module.class || moduleUnique || !eddb.mtype[mtype].modulenames[module.name])) {
						divType.appendChild(divRow);
						divRow = null;
					}
					if (module) {
						moduleSize = (module.class || 0) | 0;
						moduleUnique = !eddb.mtype[mtype].modulenames[module.name];
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
						label.className = 'togglebutton' + (moduleUnique ? ' unique' : '');
						label.draggable = true;
						var input = document.createElement('input');
						input.type = 'radio';
						input.id = 'outfitting_module_' + mID;
						input.name = 'module';
						input.value = mID;
						var div = document.createElement('div');
						div.innerHTML = getModuleLabel(module, !moduleUnique, true);
						
						label.appendChild(input);
						label.appendChild(div);
						divRow.appendChild(label);
						typeSizeMin = min(typeSizeMin, moduleSize);
						typeSizeMax = max(typeSizeMax, moduleSize);
					}
				}
				for (var m = (1 + 2 * Math.random()) | 0;  fakeTypeStored && m > 0;  m--) { // TODO
					divRow = document.createElement('div');
					divRow.id = 'outfitting_modules_mtype_' + mtype + '_stored_' + m;
					var classes = group + ' ' + mtype + ' row stored sized size' + m;
					if (cache.mtypeSizeGaps[mtype] && cache.mtypeSizeGaps[mtype][m]) {
						classes += ' size' + cache.mtypeSizeGaps[mtype][m].join(' size');
					}
					for (var c = ((mtype === 'cls' || mtype === 'cs') ? m : MAX_SLOT_CLASS);  c >= m;  c--) {
						classes += ' fitsize' + c;
					}
					divRow.className = classes;
					var label = document.createElement('label');
					label.className = 'togglebutton unique';
					label.draggable = true;
					var input = document.createElement('input');
					input.type = 'radio';
					input.id = 'outfitting_module_' + mtype + '_' + m;
					input.name = 'module';
					input.value = mtype + '_' + m;
					var div = document.createElement('div');
					div.innerHTML = 'Stored '+mtype+' #' + m;
					
					label.appendChild(input);
					label.appendChild(div);
					divRow.appendChild(label);
					divType.appendChild(divRow);
					divRow = null;
				}
				var classes = group + ' ' + mtype + ' mtype sized' + (fakeTypeStored ? ' stored' : ''); // TODO
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
	
	
	var setUIModuleTab = function(tab) {
		current.tab = tab;
		document.forms.modules.elements.tab.value = tab;
		document.forms.modules.className = tab;
	}; // setUIModuleTab()
	
	
	var setUIPickerModule = function(modid, scroll) {
		var input = document.getElementById('outfitting_module_' + (modid || document.forms.modules.elements.module.value));
		if (!input)
			return false;
		if (modid) {
			input.checked = true;
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
		} else {
			input.checked = false;
		}
		return true;
	}; // setUIPickerModule()
	
	
	/*
	* BUILD UI
	*/
	
	
	var initUIFitSlots = function() {
		var divLeft = document.createElement('div');
		divLeft.className = 'slots_column';
		
		var tableLeft = document.createElement('table');
		tableLeft.id = 'outfitting_fit_left';
		tableLeft.appendChild(createUIFitHeader());
		
		var tbody = document.createElement('tbody');
		tbody.id = 'outfitting_fit_ship_hull';
		tbody.appendChild(createUIFitSlotRow('ship', 'hull'));
		tableLeft.appendChild(tbody);
		
		var divRight = document.createElement('div');
		divRight.className = 'slots_column';
		
		var tableRight = document.createElement('table');
		tableRight.id = 'outfitting_fit_right';
		tableRight.appendChild(createUIFitHeader());
		
		var tbody = document.createElement('tbody');
		tbody.id = 'outfitting_fit_ship_hatch';
		tbody.appendChild(createUIFitSlotRow('ship', 'hatch'));
		tableRight.appendChild(tbody);
		
		for (var g = 0;  g < GROUPS.length;  g++) {
			var group = GROUPS[g];
			var tbody = document.createElement('tbody');
			tbody.id = 'outfitting_fit_' + group;
			tbody.appendChild(createUIFitSlotRow(group));
			((group == 'hardpoint' || group == 'component') ? tableLeft : tableRight).appendChild(tbody);
		}
		divLeft.appendChild(tableLeft);
		divRight.appendChild(tableRight);
		
		document.getElementById('outfitting_fit_slots').appendChild(divLeft);
		document.getElementById('outfitting_fit_slots').appendChild(divRight);
	}; // initUIFitSlots()
	
	
	var createUIFitHeader = function() {
		var thead = document.createElement('thead');
		var tr = document.createElement('tr');
		
		var th = document.createElement('th');
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'CL';
		abbr.title = 'Slot size class';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
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
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Power';
		abbr.title = 'Module power output or draw (in megawatts), powered status, and power priority group';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'outfitting_fit_price';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Price';
		abbr.title = 'Hull or module price (in credits); for hulls, this excludes all stock modules';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		thead.appendChild(tr);
		return thead;
	}; // createUIFitHeader()
	
	
	var createUIFitSlotRow = function(group, slot) {
		var tr = document.createElement('tr');
		if (!group) {
			var td = document.createElement('td');
			td.colSpan = 5;
			tr.appendChild(td);
		} else if (GROUP_LABEL[group] && isNaN(slot)) {
			var th = document.createElement('th');
			tr.appendChild(th);
			var th = document.createElement('th');
			th.colSpan = 4;
			th.innerHTML = GROUP_LABEL[group];
			tr.appendChild(th);
		} else {
			var group_slot = group + '_' + slot;
			tr.id = 'outfitting_fit_slot_' + group_slot;
			
			var td = document.createElement('td');
			td.id = 'outfitting_fit_class_' + group_slot;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.id = 'outfitting_fit_module_' + group_slot;
			td.className = '';
			var label = document.createElement('label');
			label.className = 'togglebutton';
			label.draggable = true;
			var input = document.createElement('input');
			input.type = 'radio';
			input.name = 'slot';
			input.value = group_slot;
			var div = document.createElement('div');
			div.id = 'outfitting_fit_name_' + group_slot;
			div.className = '';
			label.appendChild(input);
			label.appendChild(div);
			td.appendChild(label);
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.id = 'outfitting_fit_mass_' + group_slot;
			td.className = 'outfitting_fit_mass';
			tr.appendChild(td);
			
			if (group_slot === 'ship_hull') {
				var td = document.createElement('td');
				td.className = 'outfitting_fit_powerdist';
				td.appendChild(createUIFitPowerDistButton('sys'));
				td.appendChild(createUIFitPowerDistButton('eng'));
				td.appendChild(createUIFitPowerDistButton('wep'));
				tr.appendChild(td);
			} else {
				var td = document.createElement('td');
				td.id = 'outfitting_fit_power_' + group_slot;
				td.className = '';
				var label = document.createElement('label');
				label.className = 'checkbox';
				var span = document.createElement('span');
				span.id = 'outfitting_fit_pwrdraw_' + group_slot;
				span.className = 'outfitting_fit_pwrdraw';
				label.appendChild(span);
				label.appendChild(document.createTextNode(' '));
				var div = document.createElement('div');
				div.id = 'outfitting_fit_powercheck_' + group_slot;
				var input = document.createElement('input');
				input.type = 'checkbox';
				input.checked = true;
				input.id = 'outfitting_fit_powered_' + group_slot;
				input.name = 'powered_' + group_slot;
				input.value = 1;
				div.appendChild(input);
				var divCheck = document.createElement('div');
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
			}
			
			var td = document.createElement('td');
			td.id = 'outfitting_fit_price_' + group_slot;
			td.className = 'outfitting_fit_price';
			tr.appendChild(td);
		}
		return tr;
	}; // createUIFitSlotRow()
	
	
	var createUIFitPowerDistButton = function(tag) {
		var button = document.createElement('button');
		button.id = 'outfitting_fit_powerdist_' + tag;
		button.name = 'powerdist_' + tag;
		button.className = 'dist4';
		var div = document.createElement('div');
		div.appendChild(document.createElement('span'));
		div.appendChild(document.createElement('span'));
		div.appendChild(document.createElement('span'));
		div.appendChild(document.createElement('span'));
		button.appendChild(div);
		button.appendChild(document.createTextNode(tag.substr(0,1).toUpperCase()));
		var span = document.createElement('span');
		span.className = 'outfitting_fit_pwrdraw';
		span.appendChild(document.createTextNode(tag.substr(1).toUpperCase()));
		button.appendChild(span);
		return button;
	}; // createUIFitPowerDistButton()
	
	
	var updateUIFitColumns = function() {
		document.getElementById('outfitting_fit').className = (
			(document.forms.fit.elements.outfitting_show_mass.checked ? '' : 'no') + 'mass ' +
			(document.forms.fit.elements.outfitting_show_power.checked ? '' : 'no') + 'power ' +
			(document.forms.fit.elements.outfitting_show_price.checked ? '' : 'no') + 'price'
		);
	}; // updateUIFitColumns()
	
	
	var setCurrentFit = function(fit) {
		current.fit = fit;
		updateUIFitShip();
		updateUIFitPowerDist();
		updateUIFitSlot('ship', 'hatch');
		for (var slotgroup in GROUP_LABEL) {
			for (var slotnum = 0;  fit.getSlot(slotgroup, slotnum);  slotnum++) {
				updateUIFitSlot(slotgroup, slotnum);
			}
		}
		updateUIFitLimitedMtypes();
		document.forms.stats.elements.stats_cur_fuel.value = fit.getStat('fuelcap');
		document.forms.stats.elements.stats_cur_cargo.value = '0';
		updateUIStats();
		setCurrentSlot('ship', 'hull');
	}; // setCurrentFit()
	
	
	var updateUIFitShip = function() {
		var shipid = current.fit.getShipID();
		var ship = eddb.ship[shipid];
		
		// set ship attributes
		document.getElementById('outfitting_fit_class_ship_hull').innerHTML = '?SML'[ship.class || 0];
		document.getElementById('outfitting_fit_name_ship_hull').innerHTML = ship.name;
		document.getElementById('outfitting_fit_mass_ship_hull').innerHTML = ship.mass.toFixed(2);
		document.getElementById('outfitting_fit_price_ship_hull').innerHTML = ship.cost.toFixed(0);
		
		// mark undersized or reserved modules
		for (var mtype in { ct:1, cpd:1, isg:1,  ifh:2, ipc:2 }) {
			for (var m = 0;  m < cache.mtypeModules[mtype].length;  m++) {
				var modid = cache.mtypeModules[mtype][m];
				var module = eddb.module[modid];
				var classname = '';
				switch (mtype) {
				case 'cpd':
					if (module.engcap < (ship.boostcost + BOOST_MARGIN))
						classname = 'notenough';
					break;
					
				case 'ct':
				case 'isg':
					if (module.maxmass < ship.mass)
						classname = 'notenough';
					break;
					
				case 'ifh':
				case 'ipc':
					if (module.reserved && !module.reserved[shipid])
						classname = 'notallowed';
					break;
				}
				document.getElementById('outfitting_module_' + modid).className = classname;
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
		var dist = current.fit.getPowerDist();
		document.getElementById('outfitting_fit_powerdist_sys').className = 'dist' + dist.sys;
		document.getElementById('outfitting_fit_powerdist_eng').className = 'dist' + dist.eng;
		document.getElementById('outfitting_fit_powerdist_wep').className = 'dist' + dist.wep;
	}; // updateUIFitPowerDist()
	
	
	var updateUIFitLimitedMtypes = function() {
		var mtypeTotal = current.fit.getLimitedMtypeTotals();
		var slot;
		for (var slotgroup in GROUP_LABEL) {
			for (var slotnum = 0;  slot = current.fit.getSlot(slotgroup, slotnum);  slotnum++) {
				var mtype = slot.getModuleLimitedMtype();
				document.getElementById('outfitting_fit_name_' + slotgroup + '_' + slotnum).className = (((mtypeTotal[mtype] || 0) > (cache.mtypeLimit[mtype] || 99)) ? 'overlimit' : '')
			}
		}
	}; // updateUIFitLimitedMtypes()
	
	
	var updateUIFitSlot = function(slotgroup, slotnum) {
		var group_slot = slotgroup + '_' + slotnum;
		var slot = current.fit.getSlot(slotgroup, slotnum);
		var modid = slot.getModuleID();
		document.getElementById('outfitting_fit_module_' + group_slot).className = (
			(slot.isModuleIDAllowed(modid) ? '' : 'notallowed ') +
			(slot.isEnough() ? '' : 'notenough ')
		);
		document.getElementById('outfitting_fit_name_' + group_slot).innerHTML = (modid ? (
			getModuleLabel(slot.getModule(), false, true) + (slot.isModified() ? '<span class="icon engineer"></span>' : '')
		) : '<span>(empty)</span>');
		var value = slot.getEffectiveAttrValue('mass') || 0;
		document.getElementById('outfitting_fit_mass_' + group_slot).innerHTML = (value ? value.toFixed(2) : '');
		document.getElementById('outfitting_fit_power_' + group_slot).className = 'priority' + slot.getPriority();
		var value = slot.getEffectiveAttrValue('pwrdraw') || 0;
		if (value) {
			document.getElementById('outfitting_fit_powercheck_' + group_slot).style.visibility = 'visible';
			document.getElementById('outfitting_fit_pwrdraw_' + group_slot).innerHTML = ('-' + value.toFixed(2));
			document.getElementById('outfitting_fit_powered_' + group_slot).checked = slot.getPowered();
			document.getElementById('outfitting_fit_priority_' + group_slot).style.visibility = 'visible';
			document.getElementById('outfitting_fit_priority_' + group_slot).innerHTML = slot.getPriority();
		} else {
			var value = slot.getEffectiveAttrValue('pwrcap') || 0;
			document.getElementById('outfitting_fit_powercheck_' + group_slot).style.visibility = 'hidden';
			document.getElementById('outfitting_fit_pwrdraw_' + group_slot).innerHTML = (value ? ('+' + value.toFixed(2)) : '');
			document.getElementById('outfitting_fit_priority_' + group_slot).style.visibility = 'hidden';
		}
		/* TODO cost discount */
		var value = slot.getEffectiveAttrValue('cost') || 0;
		document.getElementById('outfitting_fit_price_' + group_slot).innerHTML = (value ? value.toFixed(0) : '');
	}; // updateUIFitSlot()
	
	
	var setCurrentSlot = function(slotgroup, slotnum) {
		current.outfitting_focus = 'slot';
		current.group = slotgroup;
		current.slot = slotnum;
		var shipid = current.fit.getShipID();
		var ship = eddb.ship[shipid];
		var reserved = ((ship.reserved || EMPTY_OBJ)[slotgroup] || EMPTY_OBJ)[slotnum];
		document.getElementById('page_body_outfitting').className = current.outfitting_focus;
		document.getElementById('outfitting_modules_picker').className = (
			slotgroup +
			((slotgroup === 'component') ? (' component_' + CORE_SLOT_ABBR[slotnum]) : '') +
			(GROUP_LABEL[slotgroup] ? (' size' + ship.slots[slotgroup][slotnum]) : ('_' + slotnum)) +
			(reserved ? ' reserved' : '')
		);
		if (reserved) {
			for (var mtype in cache.mtypeModules) {
				var div = document.getElementById('outfitting_modules_mtype_' + mtype);
				if (reserved[mtype]) {
					div.classList.add('reserved');
				} else {
					div.classList.remove('reserved');
				}
			}
		}
		if (GROUP_LABEL[slotgroup]) {
			setUIPickerModule(current.fit.getSlot(slotgroup, slotnum).getModuleID(), current.tab === 'SLOT');
		} else {
			setUIPickerModule(0);
		}
		document.forms.fit.elements.slot.value = slotgroup + '_' + slotnum;
		updateUIDetailsModule();
	}; // setCurrentSlot()
	
	
	var setCurrentFitSlotModuleID = function(slotgroup, slotnum, modid) {
		var slot = current.fit.getSlot(slotgroup, slotnum);
		var mtypeOld = slot.getModuleMtype();
		if (slot.setModuleID(modid)) {
			var mtypeNew = slot.getModuleMtype();
			updateUIFitSlot(slotgroup, slotnum);
			// TODO: in non-experimental mode, auto remove excess limited modules
			if (cache.mtypeLimit[mtypeOld] || cache.mtypeLimit[mtypeNew])
				updateUIFitLimitedMtypes();
			updateUIStats();
			setCurrentSlot(slotgroup, slotnum);
		}
	}; // setCurrentFitSlotModuleID()
	
	
	var swapCurrentFitSlotModules = function(slotgroup1, slotnum1, slotgroup2, slotnum2) {
		if (current.fit.swapSlots(slotgroup1, slotnum1, slotgroup2, slotnum2)) {
			updateUIFitSlot(slotgroup1, slotnum1);
			updateUIFitSlot(slotgroup2, slotnum2);
			setCurrentSlot(slotgroup2, slotnum2);
			// for most modules the stats don't care which slot they're in, but there is one notable exception
			if ((slotgroup1 === 'component' && slotnum1 === CORE_ABBR_SLOT.FT) || (slotgroup2 === 'component' && slotnum2 === CORE_ABBR_SLOT.FT))
				updateUIStats();
		}
	}; // swapCurrentFitSlotModules()
	
	
	var changeCurrentFitPowerDist = function(to, delta) {
		current.fit.changePowerDist(to, delta);
		updateUIFitPowerDist();
		updateUIStats();
	}; // changeCurrentFitPowerDist()
	
	
	var setCurrentFitSlotPowered = function(slotgroup, slotnum, powered) {
		current.fit.getSlot(slotgroup, slotnum).setPowered(powered);
		updateUIFitSlot(slotgroup, slotnum);
		updateUIStats();
	}; // setCurrentFitSlotPowered()
	
	
	var changeCurrentFitSlotPriority = function(slotgroup, slotnum, delta) {
		current.fit.getSlot(slotgroup, slotnum).changePriority(delta);
		updateUIFitSlot(slotgroup, slotnum);
		updateUIStats();
	}; // changeCurrentFitSlotPriority()
	
	
	/*
	* DETAILS UI
	*/
	
	
	var initUIDetails = function() {
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
		var input = document.createElement('input');
		input.id = 'outfitting_details_input_' + r;
		input.type = 'text';
		td.appendChild(input);
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.id = 'outfitting_details_unit_' + r;
		tr.appendChild(td);
		
		var td = document.createElement('td');
		td.id = 'outfitting_details_mod_' + r;
		tr.appendChild(td);
		
		tbody.appendChild(tr);
		return true;
	}; // addUIDetailsAttrRow()
	
	
	var updateUIDetailsModule = function() {
		var slot, modid, module, modifiable;
		if (current.outfitting_focus === 'module') {
			modid = document.forms.modules.elements.module.value;
			module = current.fit.getModule(modid);
		} else if (current.outfitting_focus === 'slot') {
			slot = current.fit.getSlot(current.group, current.slot);
			modid = slot.getModuleID();
			module = slot.getModule();
			modifiable = slot.isModifiable();
		}
		
		document.getElementById('outfitting_details_module').style.visibility = (module ? 'visible' : 'hidden');
		if (!module)
			return;
		
		// set displayed label
		document.getElementById('outfitting_details_label').innerHTML = (module.mtype ? getModuleLabel(module, false, true) : module.name);
		
		// update blueprint selector
		var select = document.forms.details.elements.blueprint;
		var idlist = cache.mtypeBlueprints[module.mtype];
		var iddata = eddb.blueprint;
		setDOMSelectLength(select, 1 + (idlist ? idlist.length : 0));
		for (var i = 0;  idlist && i < idlist.length;  i++) {
			select.options[i+1].value = idlist[i];
			select.options[i+1].text = iddata[idlist[i]].name;
		}
		select.disabled = !(modifiable && idlist);
		
		// update experimental selector
		var select = document.forms.details.elements.expeffect;
		var idlist = cache.mtypeExpeffects[module.mtype];
		var iddata = eddb.expeffect;
		setDOMSelectLength(select, 1 + (idlist ? idlist.length : 0));
		for (var i = 0;  idlist && i < idlist.length;  i++) {
			select.options[i+1].value = idlist[i];
			select.options[i+1].text = iddata[idlist[i]].name;
		}
		select.disabled = !(modifiable && idlist);
		
		// set displayed blueprint and expeffect
		updateUIBlueprint();
		updateUIExpeffect();
		
		// update attribute rows
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
			input.disabled = !(modifiable && (isModuleAttrModifiable(module, attr) || ((attr === 'rof') && isModuleAttrModifiable(module, 'bstint'))));
			
			var unit = document.getElementById('outfitting_details_unit_' + r);
			unit.innerHTML = (attribute.unit || '');
			
			tbody.rows[r].style.display = '';
		}
		for (var r = attrs.length;  r < tbody.rows.length;  r++) {
			document.getElementById('outfitting_details_input_' + r).name = '_disabled_' + r;
			tbody.rows[r].style.display = 'none';
		}
		
		// set displayed attribute values
		updateUIDetailsAttrs();
	}; // updateUIDetailsModule()
	
	
	var updateUIDetailsAttrs = function() {
		var slot, modid, module;
		if (current.outfitting_focus === 'module') {
			modid = document.forms.modules.elements.module.value;
			module = current.fit.getModule(modid);
		} else if (current.outfitting_focus === 'slot') {
			slot = current.fit.getSlot(current.group, current.slot);
			modid = slot.getModuleID();
			module = slot.getModule();
		}
		if (!module)
			return false;
		
		var input;
		for (var r = 0;  (input = document.getElementById('outfitting_details_input_' + r)) && eddb.attribute[input.name];  r++) {
			/* TODO ship rank
			if (eddb.rank[ship.faction] && value < eddb.rank[ship.faction].length)
				value = eddb.rank[ship.faction][value] + ' (' + value + ')';
			*/
			/* TODO cost discount */
			var attr = input.name;
			var modifier = (slot ? slot.getEffectiveAttrModifier(attr) : 0);
			var direction = getAttrModifierDirection(attr, modifier);
			var value = getModuleAttrValue(module, attr, modifier);
			input.value = getModuleAttrValueText(module, attr, value);
			var moddisplay = document.getElementById('outfitting_details_mod_' + r);
			moddisplay.className = (direction ? ((direction < 0) ? 'modbad' : 'modgood') : '');
			moddisplay.innerHTML = getModuleAttrModifierText(module, attr, modifier);
		}
		return true;
	}; // updateUIDetailsAttrs()
	
	
	var updateUIBlueprint = function() {
		var modifiable = false;
		var bpid = 0;
		var bpgrade = 0;
		if (current.outfitting_focus === 'slot') {
			var slot = current.fit.getSlot(current.group, current.slot);
			if (current.group !== 'ship')
				modifiable = !!cache.mtypeBlueprints[(slot.getModule() || EMPTY_OBJ).mtype];
			bpid = slot.getBlueprintID();
			bpgrade = slot.getBlueprintGrade()
		}
		
		document.getElementById('outfitting_details_module').className = (bpgrade ? ('grade_' + bpgrade) : '');
		
		var maxgrade = (bpid ? eddb.blueprint[bpid].maxgrade : 0);
		for (var g = 1;  g <= MAX_BLUEPRINT_GRADE;  g++) {
			document.getElementById('blueprint_grade_' + g).disabled = (g > maxgrade);
		}
		
		var buttons = document.getElementById('details_select_expeffect').getElementsByTagName('BUTTON');
		for (var i = 0;  i < buttons.length;  i++) {
			buttons[i].disabled = !bpid;
		}
		
		if (modifiable) {
			document.forms.details.elements.blueprint.value = (bpid || '');
		} else {
			document.forms.details.elements.blueprint.selectedIndex = -1;
		}
	}; // updateUIBlueprint()
	
	
	var updateUIExpeffect = function() {
		var modifiable = false;
		var expid = 0;
		if (current.outfitting_focus === 'slot') {
			var slot = current.fit.getSlot(current.group, current.slot);
			if (current.group !== 'ship')
				modifiable = !!cache.mtypeBlueprints[(slot.getModule() || EMPTY_OBJ).mtype];
			expid = slot.getExpeffectID();
		}
		
		if (modifiable) {
			document.forms.details.elements.expeffect.value = (expid || '');
		} else {
			document.forms.details.elements.expeffect.selectedIndex = -1;
		}
		
		document.getElementById('details_expeffect').innerHTML = ((eddb.expeffect[expid] || EMPTY_OBJ).special || '');
	}; // updateUIExpeffect()
	
	
	/*
	* STATS UI
	*/
	
	
	var setStatsCurFuel = function(value) {
		value = min(max(value, 0), current.fit.getStat('fuelcap'));
		document.forms.stats.elements.stats_cur_fuel.value = value;
		updateUIStats();
	}; // setStatsCurFuel()
	
	
	var setStatsCurCargo = function(value) {
		value = min(max(value, 0), current.fit.getStat('cargocap'));
		document.forms.stats.elements.stats_cur_cargo.value = value;
		updateUIStats();
	}; // setStatsCurCargo()
	
	
	var updateUIStats = function() {
		// TODO insurance, discounts
		
		// update thruster options
		var massBase = current.fit.getStat('mass') + current.fit.getStat('fuelcap') + current.fit.getStat('cargocap');
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.TH);
		if (slot.getEffectiveAttrValue('maxmass') < massBase) {
			document.getElementById('outfitting_fit_module_component_' + CORE_ABBR_SLOT.TH).classList.add('notenough');
			document.getElementById('outfitting_stats_max_mass').className = 'error';
		} else {
			document.getElementById('outfitting_fit_module_component_' + CORE_ABBR_SLOT.TH).classList.remove('notenough');
			document.getElementById('outfitting_stats_max_mass').className = '';
		}
		massBase -= slot.getEffectiveAttrValue('mass');
		for (var m = 0;  m < cache.mtypeModules['ct'].length;  m++) {
			var modid = cache.mtypeModules['ct'][m];
			var module = current.fit.getModule(modid);
			document.getElementById('outfitting_module_' + modid).className = ((getModuleAttrValue(module, 'maxmass') < (massBase + getModuleAttrValue(module, 'mass'))) ? 'notenough' : '');
		}
		
		updateUIStatsTotals();
		updateUIStatsPower();
		updateUIStatsNavFSD();
		updateUIStatsNavThr();
		updateUIStatsThm();
		updateUIStatsShd();
		updateUIStatsArm();
		updateUIStatsWpn();
	}; // updateUIStats()
	
	
	var updateUIStatsTotals = function() {
		// get primary stats
		var mass = current.fit.getStat('mass');
		var fuelcap = current.fit.getStat('fuelcap');
		var cargocap = current.fit.getStat('cargocap');
		var cabincap = current.fit.getStat('cabincap');
		
		// compute derived stats
		var curTtlFuel = min(max(parseFloat(document.forms.stats.elements.stats_cur_fuel.value) || 0, 0), fuelcap);
		var curTtlCrgo = min(max(parseFloat(document.forms.stats.elements.stats_cur_cargo.value) || 0, 0), cargocap);
		var curTtlMass = mass + curTtlFuel + curTtlCrgo;
		var maxTtlMass = mass + fuelcap + cargocap;
		
		// update displays
		document.getElementById('outfitting_stats_cur_mass').innerHTML = formatAttrHTML('mass', curTtlMass, 1);
		document.getElementById('outfitting_stats_max_mass').innerHTML = formatAttrHTML('mass', maxTtlMass, 1);
		document.getElementById('outfitting_stats_max_fuel').innerHTML = formatAttrHTML('mass', fuelcap, 0);
		document.getElementById('outfitting_stats_max_cargo').innerHTML = formatAttrHTML('mass', cargocap, 0);
		document.getElementById('outfitting_stats_max_psgr').innerHTML = formatAttrHTML('mass', cabincap, 0);
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
		document.getElementById('outfitting_stats_power_ret').innerHTML = (formatNumHTML(pwrdraw_ret[0], 2) + ' <small class="semantic">/</small> ' + formatAttrHTML('pwrcap', pwrcap, 2) + ' (' + formatPctHTML(pwrdraw_ret[0] / pwrcap, 1) + ')');
		document.getElementById('outfitting_stats_power_ret').className = ((pwrdraw_ret[0] > pwrcap) ? 'error' : '');
		document.getElementById('outfitting_stats_power_dep').innerHTML = (formatNumHTML(pwrdraw_dep[0], 2) + ' <small class="semantic">/</small> ' + formatAttrHTML('pwrcap', pwrcap, 2) + ' (' + formatPctHTML(pwrdraw_dep[0] / pwrcap, 1) + ')');
		document.getElementById('outfitting_stats_power_dep').className = ((pwrdraw_dep[0] > pwrcap) ? 'error' : '');
	}; // updateUIStatsPower()
	
	
	var updateUIStatsNavFSD = function() {
		// get primary stats
		var mass = current.fit.getStat('mass');
		var fuelcap = current.fit.getStat('fuelcap');
		var cargocap = current.fit.getStat('cargocap');
		var scooprate = current.fit.getStat('scooprate');
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.FD);
		var optmass = slot.getEffectiveAttrValue('optmass');
		var maxfuel = slot.getEffectiveAttrValue('maxfuel');
		var fuelmul = slot.getEffectiveAttrValue('fuelmul');
		var fuelpower = slot.getEffectiveAttrValue('fuelpower');
		
		// compute derived stats
		var curTtlFuel = min(max(parseFloat(document.forms.stats.elements.stats_cur_fuel.value) || 0, 0), fuelcap);
		var curTtlCrgo = min(max(parseFloat(document.forms.stats.elements.stats_cur_cargo.value) || 0, 0), cargocap);
		var curNavJmp = getJumpDistance(mass + curTtlFuel + curTtlCrgo, min(curTtlFuel, maxfuel), optmass, fuelmul, fuelpower);
		var ldnNavJmp = getJumpDistance(mass + fuelcap    + cargocap  , min(fuelcap   , maxfuel), optmass, fuelmul, fuelpower);
		var unlNavJmp = getJumpDistance(mass + fuelcap                , min(fuelcap   , maxfuel), optmass, fuelmul, fuelpower);
		var maxNavJmp = getJumpDistance(mass + min(fuelcap, maxfuel)  , min(fuelcap   , maxfuel), optmass, fuelmul, fuelpower);
		var curNavRng = getJumpRange(curTtlFuel, mass + curTtlFuel + curTtlCrgo, min(curTtlFuel, maxfuel), optmass, fuelmul, fuelpower);
		var ldnNavRng = getJumpRange(fuelcap   , mass + fuelcap    + cargocap  , min(fuelcap   , maxfuel), optmass, fuelmul, fuelpower);
		var unlNavRng = getJumpRange(fuelcap   , mass + fuelcap                , min(fuelcap   , maxfuel), optmass, fuelmul, fuelpower);
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
		document.getElementById('outfitting_stats_scoop_jump' ).innerHTML = (scooprate ? formatTimeHTML(scpNavJmp) : htmlNA);
		document.getElementById('outfitting_stats_scoop_range').innerHTML = (scooprate ? formatTimeHTML(scpNavRng) : htmlNA);
		document.getElementById('outfitting_stats_scoop_speed').innerHTML = (scooprate ? formatAttrHTML('scooprate', scooprate) : htmlNA);
	}; // updateUIStatsNavFSD()
	
	
	var updateUIStatsNavThr = function() {
		// get primary stats
		var mass = current.fit.getStat('mass');
		var fuelcap = current.fit.getStat('fuelcap');
		var cargocap = current.fit.getStat('cargocap');
		var powerdist_eng = current.fit.getPowerDist('eng');
		
		var slot = current.fit.getSlot('ship', 'hull');
		var minthrust = slot.getEffectiveAttrValue('minthrust') / 100.0;
		var boostcost = slot.getEffectiveAttrValue('boostcost');
		var topspd = slot.getEffectiveAttrValue('topspd');
		var bstspd = slot.getEffectiveAttrValue('bstspd');
		var pitch = slot.getEffectiveAttrValue('pitch');
		var roll = slot.getEffectiveAttrValue('roll');
		var yaw = slot.getEffectiveAttrValue('yaw');
		
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.PD);
		var engcap = slot.getEffectiveAttrValue('engcap');
		var engchg = slot.getEffectiveAttrValue('engchg');
		
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.TH);
		var minmass = slot.getEffectiveAttrValue('minmass');
		var optmass = slot.getEffectiveAttrValue('optmass');
		var maxmass = slot.getEffectiveAttrValue('maxmass');
		var minmulspd = slot.getEffectiveAttrValue('minmulspd') / 100.0;
		var optmulspd = slot.getEffectiveAttrValue('optmulspd') / 100.0;
		var maxmulspd = slot.getEffectiveAttrValue('maxmulspd') / 100.0;
		var minmulrot = slot.getEffectiveAttrValue('minmulrot') / 100.0;
		var optmulrot = slot.getEffectiveAttrValue('optmulrot') / 100.0;
		var maxmulrot = slot.getEffectiveAttrValue('maxmulrot') / 100.0;
		
		// compute derived stats
		var curTtlFuel = min(max(parseFloat(document.forms.stats.elements.stats_cur_fuel.value) || 0, 0), fuelcap);
		var curTtlCrgo = min(max(parseFloat(document.forms.stats.elements.stats_cur_cargo.value) || 0, 0), cargocap);
		var powerdistEngMul = (1.0 - (((MAX_POWER_DIST - powerdist_eng) / MAX_POWER_DIST) * (1.0 - minthrust)))
		var curNavSpdMul = getMassCurveMultiplier(mass + curTtlFuel + curTtlCrgo, minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd);
		var ldnNavSpdMul = getMassCurveMultiplier(mass + fuelcap    + cargocap  , minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd);
		var unlNavSpdMul = getMassCurveMultiplier(mass + fuelcap                , minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd);
		var maxNavSpdMul = getMassCurveMultiplier(mass                          , minmass, optmass, maxmass, minmulspd, optmulspd, maxmulspd);
		var engcapEnough = (engcap > boostcost + BOOST_MARGIN);
		var curNavFrq = (boostcost / (engchg * pow(powerdist_eng / MAX_POWER_DIST, 1.1)));
		var maxNavFrq = (boostcost / engchg);
		var curHndRotMul = getMassCurveMultiplier(mass + curTtlFuel + curTtlCrgo, minmass, optmass, maxmass, minmulrot, optmulrot, maxmulrot);
		var maxHndRotMul = getMassCurveMultiplier(mass                          , minmass, optmass, maxmass, minmulrot, optmulrot, maxmulrot);
		
		// update nav displays
		var htmlErrorTH = '<abbr class="error" title="Thruster has insufficient maximum mass">ERR</abbr>';
		var htmlErrorPD = '<abbr class="error" title="Power distributor has insufficient ENG capacitor to boost">ERR</abbr>';
		document.getElementById('outfitting_stats_cur_speed'    ).innerHTML = (isNaN(curNavSpdMul) ? htmlErrorTH : formatAttrHTML('topspd', topspd * curNavSpdMul * powerdistEngMul));
		document.getElementById('outfitting_stats_laden_speed'  ).innerHTML = (isNaN(ldnNavSpdMul) ? htmlErrorTH : formatAttrHTML('topspd', topspd * ldnNavSpdMul));
		document.getElementById('outfitting_stats_unladen_speed').innerHTML = (isNaN(unlNavSpdMul) ? htmlErrorTH : formatAttrHTML('topspd', topspd * unlNavSpdMul));
		document.getElementById('outfitting_stats_max_speed'    ).innerHTML = (isNaN(maxNavSpdMul) ? htmlErrorTH : formatAttrHTML('topspd', topspd * maxNavSpdMul));
		document.getElementById('outfitting_stats_cur_boost'    ).innerHTML = (isNaN(curNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatAttrHTML('bstspd', bstspd * curNavSpdMul)));
		document.getElementById('outfitting_stats_laden_boost'  ).innerHTML = (isNaN(ldnNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatAttrHTML('bstspd', bstspd * ldnNavSpdMul)));
		document.getElementById('outfitting_stats_unladen_boost').innerHTML = (isNaN(unlNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatAttrHTML('bstspd', bstspd * unlNavSpdMul)));
		document.getElementById('outfitting_stats_max_boost'    ).innerHTML = (isNaN(maxNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatAttrHTML('bstspd', bstspd * maxNavSpdMul)));
		document.getElementById('outfitting_stats_cur_boostfreq').innerHTML = (isNaN(curNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatTimeHTML(curNavFrq < 5.0 ? (1/0) : curNavFrq)));
		document.getElementById('outfitting_stats_max_boostfreq').innerHTML = (isNaN(maxNavSpdMul) ? htmlErrorTH : (!engcapEnough ? htmlErrorPD : formatTimeHTML(maxNavFrq < 5.0 ? (1/0) : maxNavFrq)));
		
		// update hnd displays
		document.getElementById('outfitting_stats_cur_pitch'    ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatAttrHTML('pitch', pitch * curHndRotMul));
		document.getElementById('outfitting_stats_cur_roll'     ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatAttrHTML('roll' , roll  * curHndRotMul));
		document.getElementById('outfitting_stats_cur_yaw'      ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatAttrHTML('yaw'  , yaw   * curHndRotMul));
		document.getElementById('outfitting_stats_cur_pitchtime').innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (pitch * curHndRotMul)));
		document.getElementById('outfitting_stats_cur_rolltime' ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (roll  * curHndRotMul)));
		document.getElementById('outfitting_stats_cur_yawtime'  ).innerHTML = (isNaN(curHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (yaw   * curHndRotMul)));
		document.getElementById('outfitting_stats_max_pitch'    ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatAttrHTML('pitch', pitch * maxHndRotMul));
		document.getElementById('outfitting_stats_max_roll'     ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatAttrHTML('roll' , roll  * maxHndRotMul));
		document.getElementById('outfitting_stats_max_yaw'      ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatAttrHTML('yaw'  , yaw   * maxHndRotMul));
		document.getElementById('outfitting_stats_max_pitchtime').innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (pitch * maxHndRotMul)));
		document.getElementById('outfitting_stats_max_rolltime' ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (roll  * maxHndRotMul)));
		document.getElementById('outfitting_stats_max_yawtime'  ).innerHTML = (isNaN(maxHndRotMul) ? htmlErrorTH : formatTimeHTML(180.0 / (yaw   * maxHndRotMul)));
	}; // updateUIStatsNavThr()
	
	
	var updateUIStatsThm = function() {
		// get primary stats
		var thmload_pwrdraw = current.fit.getStat('thmload_pwrdraw');
		var thmload_ct = current.fit.getStat('thmload_ct');
		var thmload_cfsd = current.fit.getStat('thmload_cfsd');
		var thmload_hardpoint = current.fit.getStat('thmload_hardpoint');
		var thmload_iscb = current.fit.getStat('thmload_iscb');
		var duration_iscb = current.fit.getStat('duration_iscb');
		
		var slot = current.fit.getSlot('ship', 'hull');
		var heatcap = slot.getEffectiveAttrValue('heatcap');
		var heatdismin = slot.getEffectiveAttrValue('heatdismin');
		var heatdismax = slot.getEffectiveAttrValue('heatdismax');
		
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.PP);
		var heateff = slot.getEffectiveAttrValue('heateff');
		
		// compute derived stats
		thmload_pwrdraw *= heateff;
		thmload_ct += thmload_pwrdraw;
		thmload_cfsd += thmload_ct;
		if (thmload_hardpoint) thmload_hardpoint += thmload_ct;
		if (thmload_iscb) thmload_iscb += thmload_ct;
		
		// update displays
		updateUIStatsThmLevel('outfitting_stats_idl_heat', thmload_pwrdraw, 0, heatdismin, heatdismax, heatcap);
		updateUIStatsThmLevel('outfitting_stats_thr_heat', thmload_ct, thmload_pwrdraw, heatdismin, heatdismax, heatcap);
		updateUIStatsThmLevel('outfitting_stats_fsd_heat', thmload_cfsd, thmload_ct, heatdismin, heatdismax, heatcap);
		updateUIStatsThmLevel('outfitting_stats_wpn_heat', thmload_hardpoint, thmload_ct, heatdismin, heatdismax, heatcap);
		updateUIStatsThmLevel('outfitting_stats_scb_heat', thmload_iscb, thmload_ct, heatdismin, heatdismax, heatcap, duration_iscb);
	}; // updateUIStatsThm()
	
	
	var updateUIStatsThmLevel = function(elementid, thmload, thmloadBase, heatdismin, heatdismax, heatcap, duration) {
		if (thmload > heatdismax) {
			var time = (heatcap / 3.0) / (thmload - heatdismax);
			if (thmloadBase <= heatdismax) {
				time += getTimeUntilHeatLevel(heatdismax, thmload, getEquilibriumHeatLevel(heatdismin, heatdismax, thmloadBase), 1.0);
			}
			if (duration && (time > duration)) {
				document.getElementById(elementid).innerHTML = formatPctHTML((2.0 + (duration / time)) / 3.0, 0);
				document.getElementById(elementid).className = '';
			} else {
				document.getElementById(elementid).innerHTML = formatTimeHTML(time);
				document.getElementById(elementid).className = 'error';
			}
		} else {
			document.getElementById(elementid).innerHTML = ((thmload > 0) ? formatPctHTML(getEquilibriumHeatLevel(heatdismin, heatdismax, thmload) / 1.5, 0) : '<small class="semantic">N/A</small>');
			document.getElementById(elementid).className = '';
		}
	}; // updateUIStatsThmLevel()
	
	
	var updateUIStatsShd = function() {
		// get primary stats
		var shieldbst = current.fit.getStat('shieldbst');
		var shieldrnf = current.fit.getStat('shieldrnf');
		var thmmod_usb = current.fit.getStat('thmmod_usb');
		var kinmod_usb = current.fit.getStat('kinmod_usb');
		var expmod_usb = current.fit.getStat('expmod_usb');
		var powerdist_sys = current.fit.getPowerDist('sys');
		var slot = current.fit.getSlot('ship', 'hull');
		var mass = slot.getEffectiveAttrValue('mass');
		var shields = slot.getEffectiveAttrValue('shields');
		for (var slotnum = 0;  slot = current.fit.getSlot('internal', slotnum);  slotnum++) {
			if (slot.getModuleMtype() === 'isg' && slot.getPowered())
				break;
		}
		var minmass = slot ? slot.getEffectiveAttrValue('minmass') : 1;
		var optmass = slot ? slot.getEffectiveAttrValue('optmass') : 2;
		var maxmass = slot ? slot.getEffectiveAttrValue('maxmass') : 3;
		var minmul = slot ? (slot.getEffectiveAttrValue('minmul') / 100.0) : 1;
		var optmul = slot ? (slot.getEffectiveAttrValue('optmul') / 100.0) : 1;
		var maxmul = slot ? (slot.getEffectiveAttrValue('maxmul') / 100.0) : 1;
		var genrate = slot ? slot.getEffectiveAttrValue('genrate') : 1;
		var thmres = slot ? (slot.getEffectiveAttrValue('thmres') / 100.0) : 0;
		var kinres = slot ? (slot.getEffectiveAttrValue('kinres') / 100.0) : 0;
		var expres = slot ? (slot.getEffectiveAttrValue('expres') / 100.0) : 0;
		
		// compute derived stats
		var hasSG = !!slot;
		var isEnough = (maxmass >= mass);
		var rawShdStr = (
				shields
				* getEffectiveShieldBoostMultiplier(shieldbst)
				* getMassCurveMultiplier(mass, minmass, optmass, maxmass, minmul, optmul, maxmul)
		);
		var absShdRes = getPipDamageResistance(powerdist_sys);
		var thmShdRes = getEffectiveDamageResistance(thmres, 1 - thmmod_usb);
		var kinShdRes = getEffectiveDamageResistance(kinres, 1 - kinmod_usb);
		var expShdRes = getEffectiveDamageResistance(expres, 1 - expmod_usb);
		
		// update displays
		var htmlNA = '<small class="semantic">N/A</small>';
		var htmlErrorSG = '<abbr class="error" title="Shield Generator has insufficient maximum mass">ERR</abbr>';
		document.getElementById('outfitting_stats_abs_shield_resist').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatPctHTML(absShdRes, 1)));
		document.getElementById('outfitting_stats_thm_shield_resist').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('thmres', thmShdRes)));
		document.getElementById('outfitting_stats_kin_shield_resist').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('kinres', kinShdRes)));
		document.getElementById('outfitting_stats_exp_shield_resist').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('expres', expShdRes)));
		document.getElementById('outfitting_stats_raw_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr, 1)));
		document.getElementById('outfitting_stats_abs_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr / (1 - absShdRes), 1)));
		document.getElementById('outfitting_stats_thm_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr / (1 - absShdRes) / (1 - thmShdRes), 1)));
		document.getElementById('outfitting_stats_kin_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr / (1 - absShdRes) / (1 - kinShdRes), 1)));
		document.getElementById('outfitting_stats_exp_shield_strength').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shields', rawShdStr / (1 - absShdRes) / (1 - expShdRes), 1)));
		document.getElementById('outfitting_stats_raw_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate)));
		document.getElementById('outfitting_stats_abs_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate / (1 - absShdRes))));
		document.getElementById('outfitting_stats_thm_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate / (1 - absShdRes) / (1 - thmShdRes))));
		document.getElementById('outfitting_stats_kin_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate / (1 - absShdRes) / (1 - kinShdRes))));
		document.getElementById('outfitting_stats_exp_shield_regen').innerHTML = (!hasSG ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('genrate', genrate / (1 - absShdRes) / (1 - expShdRes))));
		document.getElementById('outfitting_stats_raw_shield_reinf').innerHTML = (!(hasSG && shieldrnf) ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shieldrnf', shieldrnf)));
		document.getElementById('outfitting_stats_abs_shield_reinf').innerHTML = (!(hasSG && shieldrnf) ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shieldrnf', shieldrnf / (1 - absShdRes))));
		document.getElementById('outfitting_stats_thm_shield_reinf').innerHTML = (!(hasSG && shieldrnf) ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shieldrnf', shieldrnf / (1 - absShdRes) / (1 - thmShdRes))));
		document.getElementById('outfitting_stats_kin_shield_reinf').innerHTML = (!(hasSG && shieldrnf) ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shieldrnf', shieldrnf / (1 - absShdRes) / (1 - kinShdRes))));
		document.getElementById('outfitting_stats_exp_shield_reinf').innerHTML = (!(hasSG && shieldrnf) ? htmlNA : (!isEnough ? htmlErrorSG : formatAttrHTML('shieldrnf', shieldrnf / (1 - absShdRes) / (1 - expShdRes))));
	}; // updateUIStatsShd();
	
	
	var updateUIStatsArm = function() {
		// get primary stats
		var hullbst = current.fit.getStat('hullbst');
		var hullrnf = current.fit.getStat('hullrnf');
		var thmmod_ihrp = current.fit.getStat('thmmod_usb');
		var kinmod_ihrp = current.fit.getStat('kinmod_usb');
		var expmod_ihrp = current.fit.getStat('expmod_usb');
		var integ_imrp = current.fit.getStat('integ_imrp');
		var dmgprot = current.fit.getStat('dmgprot');
		
		var slot = current.fit.getSlot('ship', 'hull');
		var armour = slot.getEffectiveAttrValue('armour');
		var hardness = slot.getEffectiveAttrValue('hardness');
		
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.BH);
		var thmres = slot.getEffectiveAttrValue('thmres');
		var kinres = slot.getEffectiveAttrValue('kinres');
		var expres = slot.getEffectiveAttrValue('expres');
		
		// compute derived stats
		var mrpArmRes = (1 - dmgprot);
		var thmArmRes = getEffectiveDamageResistance(thmres / 100, 1 - thmmod_ihrp);
		var kinArmRes = getEffectiveDamageResistance(kinres / 100, 1 - kinmod_ihrp);
		var expArmRes = getEffectiveDamageResistance(expres / 100, 1 - expmod_ihrp);
		var rawArmInt = (armour * (1 + (hullbst / 100))) + hullrnf;
		var thmArmInt = (rawArmInt / (1 - thmArmRes));
		var kinArmInt = (rawArmInt / (1 - kinArmRes));
		var expArmInt = (rawArmInt / (1 - expArmRes));
		
		// update displays
		var htmlNA = '<small class="semantic">N/A</small>';
		document.getElementById('outfitting_stats_raw_armour_hardness').innerHTML = formatNumHTML(hardness, 0);
		document.getElementById('outfitting_stats_mod_armour_protect').innerHTML = (integ_imrp ? formatAttrHTML('dmgprot', mrpArmRes) : htmlNA);
		document.getElementById('outfitting_stats_thm_armour_resist').innerHTML = formatAttrHTML('thmres', thmArmRes);
		document.getElementById('outfitting_stats_kin_armour_resist').innerHTML = formatAttrHTML('kinres', kinArmRes);
		document.getElementById('outfitting_stats_exp_armour_resist').innerHTML = formatAttrHTML('expres', expArmRes);
		document.getElementById('outfitting_stats_raw_armour_integ').innerHTML = formatNumHTML(rawArmInt, 1);
		document.getElementById('outfitting_stats_mod_armour_integ').innerHTML = (integ_imrp ? formatNumHTML(integ_imrp, 1) : htmlNA);
		document.getElementById('outfitting_stats_thm_armour_integ').innerHTML = formatNumHTML(thmArmInt, 1);
		document.getElementById('outfitting_stats_kin_armour_integ').innerHTML = formatNumHTML(kinArmInt, 1);
		document.getElementById('outfitting_stats_exp_armour_integ').innerHTML = formatNumHTML(expArmInt, 1);
	}; // updateUIStatsArm()
	
	
	var updateUIStatsWpn = function() {
		// get primary stats
		var distdraw_second = current.fit.getStat('distdraw_second');
		var dps_distdraw = current.fit.getStat('dps_distdraw');
		var dps_nodistdraw = current.fit.getStat('dps_nodistdraw');
		var dps_abs = current.fit.getStat('dps_abs');
		var dps_thm = current.fit.getStat('dps_thm');
		var dps_kin = current.fit.getStat('dps_kin');
		var dps_exp = current.fit.getStat('dps_exp');
		var powerdist_wep = current.fit.getPowerDist('wep');
		var slot = current.fit.getSlot('component', CORE_ABBR_SLOT.PD);
		var wepcap = slot.getEffectiveAttrValue('wepcap');
		var wepchg = slot.getEffectiveAttrValue('wepchg');
		
		// compute derived stats
		var powerdistWepMul = pow(powerdist_wep / MAX_POWER_DIST, 1.1);
		var curWpnCap = (wepcap / max(0, distdraw_second - wepchg * powerdistWepMul));
		var maxWpnCap = (wepcap / max(0, distdraw_second - wepchg));
		var curWpnSus = min(1, wepchg * powerdistWepMul / distdraw_second);
		var maxWpnSus = min(1, wepchg / distdraw_second);
		
		// update displays
		var htmlNA = '<small class="semantic">N/A</small>';
		document.getElementById('outfitting_stats_wpn_raw_burst').innerHTML = ((dps_nodistdraw || dps_distdraw) ? formatAttrHTML('dps', dps_nodistdraw + dps_distdraw, 1) : htmlNA);
		document.getElementById('outfitting_stats_wpn_abs_burst').innerHTML = ((dps_nodistdraw || dps_distdraw) ? formatPctHTML(dps_abs / (dps_nodistdraw + dps_distdraw), 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_thm_burst').innerHTML = ((dps_nodistdraw || dps_distdraw) ? formatPctHTML(dps_thm / (dps_nodistdraw + dps_distdraw), 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_kin_burst').innerHTML = ((dps_nodistdraw || dps_distdraw) ? formatPctHTML(dps_kin / (dps_nodistdraw + dps_distdraw), 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_exp_burst').innerHTML = ((dps_nodistdraw || dps_distdraw) ? formatPctHTML(dps_exp / (dps_nodistdraw + dps_distdraw), 0) : htmlNA);
		document.getElementById('outfitting_stats_wpn_cur_cap').innerHTML = ((dps_nodistdraw || dps_distdraw) ? formatTimeHTML(curWpnCap) : htmlNA);
		document.getElementById('outfitting_stats_wpn_max_cap').innerHTML = ((dps_nodistdraw || dps_distdraw) ? formatTimeHTML(maxWpnCap) : htmlNA);
		document.getElementById('outfitting_stats_wpn_cur_sus').innerHTML = ((dps_nodistdraw || dps_distdraw) ? formatPctHTML(curWpnSus, 1) : htmlNA);
		document.getElementById('outfitting_stats_wpn_max_sus').innerHTML = ((dps_nodistdraw || dps_distdraw) ? formatPctHTML(maxWpnSus, 1) : htmlNA);
	}; // updateUIStatsWpn()
	
	
	/*
	* UI EVENT HANDLERS
	*/
	
	
	var onUIPageHeaderChange = function(e) {
		setUIPageTab(e.target.value);
	}; // onUIPageHeaderChange()
	
	
	var onUIShipyardTableClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'TR') {
			el = el.parentNode;
		}
		if (el) {
			var tokens = el.id.split('_');
			if (tokens[1] === 'ship') {
				setCurrentFit(new Build(tokens[2], true));
				setUIPageTab('outfitting');
			}
		}
	}; // onUIShipyardTableClick()
	
	
	var onUIModuleTabChange = function(e) {
		if (e.target.name === 'tab' && e.target.checked) {
			setUIModuleTab(e.target.value);
		}
	}; // onUIModuleTabChange()
	
	
	var onUIModulePickerChange = function(e) {
		if (e.target.name === 'module' && e.target.checked) {
			current.outfitting_focus = 'module';
			document.getElementById('page_body_outfitting').className = current.outfitting_focus;
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
			if (inputs.length > 0 && inputs[0].checked && inputs[0].name === 'module' && current.outfitting_focus !== 'module') {
				current.outfitting_focus = 'module';
				document.getElementById('page_body_outfitting').className = current.outfitting_focus;
				updateUIDetailsModule();
			}
		}
	}; // onUIModulePickerClick()
	
	
	var onUIModulePickerDblClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'LABEL' && el.tagName !== 'INPUT') {
			el = el.parentNode;
		}
		if (!el) {
		} else if (el.tagName === 'LABEL') {
			var inputs = el.getElementsByTagName('INPUT');
			if (inputs.length > 0 && inputs[0].checked && inputs[0].name === 'module') {
				setCurrentFitSlotModuleID(current.group, current.slot, inputs[0].value | 0);
			}
		}
	}; // onUIModulePickerDblClick()
	
	
	var onUIModulePickerDragStart = function(e) {
		if (e.target && e.target.tagName === 'LABEL') {
			var inputs = e.target.getElementsByTagName('INPUT');
			var modid = inputs[0].value;
			// TODO: ghost bug in chrome
			e.dataTransfer.setData('edsy/mid', modid);
			e.dataTransfer.effectAllowed = 'copy';
			setCurrentDrag(modid);
		}
	}; // onUIModulePickerDragStart()
	
	
	var onUIModulePickerDragEnd = function(e) {
		setCurrentDrag(0);
	}; // onUIModulePickerDragEnd()
	
	
	var onUIModulePickerDragEnter = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/slot')) {
			e.preventDefault();
			// TODO .dragready highlighting
		}
	}; // onUIModulePickerDragEnter()
	
	
	var onUIModulePickerDragOver = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/slot')) {
			e.preventDefault();
		}
	}; // onUIModulePickerDragOver()
	
	
	var onUIModulePickerDragLeave = function(e) {
		// TODO .dragready highlighting
	}; // onUIModulePickerDragLeave()
	
	
	var onUIModulePickerDrop = function(e) {
		var group = e.dataTransfer.getData('edsy/group');
		var slot = e.dataTransfer.getData('edsy/slot');
		if (group) {
			e.preventDefault();
			setCurrentFitSlotModuleID(group, slot, 0);
		}
	}; // onUIModulePickerDrop()
	
	
	var onUIFitSettingsChange = function(e) {
		if (e.target.name) {
			updateUIFitColumns();
		}
	}; // onUIFitSettingsChange()
	
	
	var onUIFitSlotsChange = function(e) {
		if (e.target.name === 'slot') {
			var tokens = e.target.value.split('_');
			setCurrentSlot(tokens[0], tokens[1]);
		} else if (e.target.type === 'checkbox') {
			var tokens = e.target.name.split('_');
			if (tokens[0] === 'powered') {
				setCurrentFitSlotPowered(tokens[1], tokens[2], e.target.checked);
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
			if (inputs.length > 0 && inputs[0].checked && inputs[0].name === 'slot') {
				var tokens = inputs[0].value.split('_');
				setCurrentSlot(tokens[0], tokens[1]);
			}
		} else if (el.tagName === 'BUTTON') {
			e.preventDefault();
			var tokens = el.name.split('_');
			if (tokens[0] === 'priority') {
				changeCurrentFitSlotPriority(tokens[1], tokens[2], 1);
			} else if (tokens[0] === 'powerdist') {
				changeCurrentFitPowerDist(tokens[1], 2);
			}
		}
	}; // onUIFitSlotsClick()
	
	
	var onUIFitSlotsDblClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'LABEL' && el.tagName !== 'INPUT') {
			el = el.parentNode;
		}
		if (!el) {
		} else if (el.tagName === 'LABEL') {
			var inputs = el.getElementsByTagName('INPUT');
			if (inputs.length > 0 && inputs[0].checked && inputs[0].name === 'slot') {
				setCurrentFitSlotModuleID(current.group, current.slot, 0);
			}
		}
	}; // onUIFitSlotsDblClick()
	
	
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
			e.dataTransfer.setData('edsy/mid', modid);
			e.dataTransfer.setData('edsy/group', slotgroup);
			e.dataTransfer.setData('edsy/slot', slotnum);
			e.dataTransfer.effectAllowed = 'move';
			setCurrentDrag(modid, slotgroup, slotnum);
		}
	}; // onUIFitSlotsDragStart()
	
	
	var onUIFitSlotsDragEnd = function(e) {
		setCurrentDrag(0);
	}; // onUIFitSlotsDragEnd()
	
	
	var onUIFitSlotsDragEnter = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/mid')) {
			e.preventDefault();
			// TODO .dragready highlighting
		}
	}; // onUIFitSlotsDragEnter()
	
	
	var onUIFitSlotsDragOver = function(e) {
		if (contains(e.dataTransfer.types, 'edsy/mid')) {
			e.preventDefault();
		}
	}; // onUIFitSlotsDragOver()
	
	
	var onUIFitSlotsDragLeave = function(e) {
		// TODO .dragready highlighting
	}; // onUIFitSlotsDragLeave()
	
	
	var onUIFitSlotsDrop = function(e) {
		var tr = e.target;
		while (tr && tr.tagName !== 'TR')
			tr = tr.parentNode;
		if (!tr)
			return;
		var mID = e.dataTransfer.getData('edsy/mid');
		var group1 = e.dataTransfer.getData('edsy/group');
		var slot1 = e.dataTransfer.getData('edsy/slot');
		var tokens = tr.id.split('_'); // outfitting_fit_slot_(group)_(slot)
		var group2 = tokens[3];
		var slot2 = tokens[4];
		if (group1) {
			e.preventDefault();
			swapCurrentFitSlotModules(group1, slot1, group2, slot2);
		} else if (mID) {
			e.preventDefault();
			setCurrentFitSlotModuleID(group2, slot2, mID);
		}
	}; // onUIFitSlotsDrop()
	
	
	var onUIDetailsModuleChange = function(e) {
		var slot = current.fit.getSlot(current.group, current.slot);
		if (e.target.name === 'blueprint') {
			slot.setBlueprintID(e.target.value);
			updateUIBlueprint();
			if (current.outfitting_focus === 'slot')
				updateUIFitSlot(current.group, current.slot);
		} else if (e.target.name === 'expeffect') {
			slot.setExpeffectID(e.target.value);
			updateUIExpeffect();
			updateUIDetailsAttrs();
			if (current.outfitting_focus === 'slot')
				updateUIFitSlot(current.group, current.slot);
			updateUIStats();
		} else if (e.target.tagName === 'INPUT') {
			var attr = e.target.name;
			var attribute = eddb.attribute[attr];
			var module = slot.getModule();
			if (attribute && module) {
				var text = e.target.value.trim();
				if (text === '') {
					if (!slot.setAttrModifier(attr))
						return;
				} else {
					if (text.slice(-1) === '%' && (attribute.unit !== '%' || text[0] === '+' || text[0] === '-')) {
						var modifier = parseModuleAttrModifierText(module, attr, text);
					} else {
						var modifier = getModuleAttrModifier(module, attr, parseFloat(text));
					}
					if (!slot.setEffectiveAttrModifier(attr, modifier))
						return;
				}
				updateUIDetailsAttrs();
				if (current.outfitting_focus === 'slot')
					updateUIFitSlot(current.group, current.slot);
				updateUIStats();
			}
		}
	}; // onUIDetailsModuleChange()
	
	
	var onUIDetailsModuleClick = function(e) {
		var el = e.target;
		while (el && el.tagName !== 'BUTTON') {
			el = el.parentNode;
		}
		if (el) {
			e.preventDefault();
			if (el.name === 'blueprint_grade') {
				if (current.fit.getSlot(current.group, current.slot).setBlueprintGrade(1*el.value))
					updateUIBlueprint();
			} else if (el.name === 'blueprint_roll') {
				var roll = parseFloat(el.value);
				if (roll < 0)
					roll = round(random() * 1000000) / 1000000;
				if (current.fit.getSlot(current.group, current.slot).setAttrModifiersForBlueprint(roll)) {
					updateUIDetailsAttrs();
					if (current.outfitting_focus === 'slot')
						updateUIFitSlot(current.group, current.slot);
					updateUIStats();
				}
			}
		}
	}; // onUIDetailsModuleClick()
	
	
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
		switch (e.target.name) {
		case 'stats_cur_fuel':   setStatsCurFuel(parseFloat(e.target.value) || 0);   break;
		case 'stats_cur_cargo':  setStatsCurCargo(parseFloat(e.target.value) || 0);  break;
		}
	}; // onUIStatsInputChange()
	
	
	var onUIOptionsChange = function(e) {
		updateUIOptions();
	}; // onUIOptionsChange()
	
	
	var onDOMContentLoaded = function(e) {
		initCache();
		initUIShipyard();
		initUIModulePicker();
		initUIFitSlots();
		initUIDetails();
		
		updateUIOptions();
		setUIPageTab('shipyard');
		setUIShipyardTab('table');
		setUIModuleTab('SLOT');
		setCurrentFit(new Build(1, true));
		updateUIFitColumns();
		
		document.getElementById('page_header').addEventListener('change', onUIPageHeaderChange);
		document.getElementById('shipyard_table').addEventListener('click', onUIShipyardTableClick);
		document.getElementById('outfitting_modules_tabs').addEventListener('change', onUIModuleTabChange);
		document.getElementById('outfitting_modules_container').addEventListener('change', onUIModulePickerChange);
		document.getElementById('outfitting_modules_container').addEventListener('click', onUIModulePickerClick);
		document.getElementById('outfitting_modules_container').addEventListener('dblclick', onUIModulePickerDblClick);
		document.getElementById('outfitting_modules_container').addEventListener('dragstart', onUIModulePickerDragStart);
		document.getElementById('outfitting_modules_container').addEventListener('dragend', onUIModulePickerDragEnd);
		document.getElementById('outfitting_modules_container').addEventListener('drop', onUIModulePickerDrop);
		document.getElementById('outfitting_fit_settings').addEventListener('change', onUIFitSettingsChange);
		document.getElementById('outfitting_fit_slots').addEventListener('change', onUIFitSlotsChange);
		document.getElementById('outfitting_fit_slots').addEventListener('click', onUIFitSlotsClick);
		document.getElementById('outfitting_fit_slots').addEventListener('dblclick', onUIFitSlotsDblClick);
		document.getElementById('outfitting_fit_slots').addEventListener('dragstart', onUIFitSlotsDragStart);
		document.getElementById('outfitting_fit_slots').addEventListener('dragend', onUIFitSlotsDragEnd);
		document.getElementById('outfitting_fit_slots').addEventListener('drop', onUIFitSlotsDrop);
		document.getElementById('outfitting_details_module').addEventListener('change', onUIDetailsModuleChange);
		document.getElementById('outfitting_details_module').addEventListener('click', onUIDetailsModuleClick);
		document.forms.stats.elements.stats_cur_fuel.addEventListener('wheel', onUIStatsInputWheel);
		document.forms.stats.elements.stats_cur_fuel.addEventListener('change', onUIStatsInputChange);
		document.forms.stats.elements.stats_cur_cargo.addEventListener('wheel', onUIStatsInputWheel);
		document.forms.stats.elements.stats_cur_cargo.addEventListener('change', onUIStatsInputChange);
		document.getElementById('page_body_options').addEventListener('change', onUIOptionsChange);
		
		// load the donate button dynamically, so that it doesn't stop the page from loading if the remote server is slow
		/* TODO smaller image, no nested forms
		document.getElementById('header_donate').innerHTML = '\
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">\
<input type="hidden" name="cmd" value="_s-xclick">\
<input type="hidden" name="hosted_button_id" value="X76V6PNF8CAV4">\
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal">\
<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">\
</form>';
		*/
	}; // onDOMContentLoaded()
	
	window.addEventListener('DOMContentLoaded', onDOMContentLoaded);
})();
