window.edshipyard = new (function() {
	
	var EMPTY_OBJ = {};
	var GROUPS = ['hardpoint','utility','component','military','internal'];
	var GROUP_LABEL = { hardpoint:'Hardpoints', utility:'Utility Mounts', component:'Core Internal', military:'Military', internal:'Optional Internal' };
	var CORE_SLOT_ABBR = ['BH','PP','TH','FD','LS','PD','SS','FT'];
	var CORE_ABBR_SLOT = { BH:0,PP:1,TH:2,FD:3,LS:4,PD:5,SS:6,FT:7,
	                            RB:1,TM:2,FH:3,EC:4,PC:5,     FS:7 };
	var BOOST_MARGIN = 0.005;
	var SHIP_HATCH_ID = 49180;
	var MAX_SLOT_CLASS = 8;
	var MAX_POWER_PRIORITY = 5;
	var MAX_BLUEPRINT_GRADE = 5;
	var HTML_ICON_UNKNOWN = '<span class="icon unknown"></span>';
	var HTML_ICON_MOUNT = { F:'<span class="icon mountFixed"></span>', G:'<span class="icon mountGimballed"></span>', T:'<span class="icon mountTurreted"></span>' };
	var HTML_ICON_MISSILE = { D:'<span class="icon missileDumbfire"></span>', S:'<span class="icon missileSeeking"></span>' };
	
	
	var cache = {};
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
		round = Math.round,
		sign = Math.sign
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
	
	
	var getJumpRange = function(mass, fuel, fsdOpt, fsdMul, fsdExp) {
		// https://forums.frontier.co.uk/showthread.php?p=643461#post643461
		return pow(fuel / fsdMul, 1 / fsdExp) * fsdOpt / mass;
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
	
	
	var getHeatLevel = function(heatcap, heatdis, thmload) {
		// https://forums.frontier.co.uk/showthread.php/286628-Research-Detailed-Heat-Mechanics
		// https://forums.frontier.co.uk/showthread.php/286628-Research-Detailed-Heat-Mechanics?p=6399855&viewfull=1#post6399855
		return pow(thmload / heatcap / heatdis, 0.5);
	}; // getHeatLevel()
	
	
	/*
	* FITS & MODULES
	*/
	
	
	var getShipIDFit = function(sID, stock) {
		var ship = eddb.ship[sID];
		if (!ship)
			throw 'invalid ship id #' + sID;
		var template = { id:0, powered:true, priority:1, blueprint:null, grade:0, expeffect:null, modifier:null, data:null };
		var fit = {
			ship : {
				hull  : clone({}, template),
				hatch : clone({}, template),
			},
			dist : { sys:4, eng:4, wep:4 },
		};
		fit.ship.hull.id = sID;
		fit.ship.hull.data = clone({}, ship);
		fit.ship.hatch.id = SHIP_HATCH_ID;
		fit.ship.hatch.data = clone({}, eddb.module[SHIP_HATCH_ID]);
		for (var group in GROUP_LABEL) {
			fit[group] = [];
			for (var slot = 0;  slot < ship.slots[group].length;  slot++) {
				var obj = clone({}, template);
				var mID = ship.stock[group][slot];
				var module = eddb.module[mID];
				if (mID && (group === 'component' || stock)) {
					if (!module)
						throw 'invalid module id #' + mID;
					obj.id = mID;
					obj.data = clone({}, module);
					if (ship.module[mID]) {
						clone(obj.data, ship.module[mID]);
					}
				}
				fit[group].push(obj);
				updateFitSlotAttributes(fit, group, slot);
			}
		}
		return fit;
	}; // getShipIDFit()
	
	
	var setFitPowerDist = function(fit, sys, eng, wep) {
		if (!fit || !fit.dist)
			return false;
		fit.dist.sys = sys = min(max(sys | 0, 0         ), 8);
		fit.dist.eng = eng = min(max(eng | 0, 0, 4 - sys), 8, 12 - sys);
		fit.dist.wep = 12 - sys - eng;
		if (fit === current.fit)
			updateUIFitPowerDist();
		return true;
	}; // setFitPowerDist()
	
	
	var changeFitPowerDist = function(fit, to, delta) {
		if (!fit || !fit.dist || !(to in fit.dist))
			return false;
		var f1 = ((to === 'sys') ? 'eng' : 'sys');
		var f2 = ((to === 'wep') ? 'eng' : 'wep');
		if (delta < 0) {
			delta = min(-delta, fit.dist[to]);
			var f1d = min(delta >> 1, 8 - fit.dist[f1]);
			var f2d = min(delta >> 1, 8 - fit.dist[f2]);
			var rd = delta - f1d - f2d;
			if (fit.dist[f2] < fit.dist[f1]) f2d += rd; else f1d += rd;
			fit.dist[to] -= delta;
			fit.dist[f1] += f1d;
			fit.dist[f2] += f2d;
		} else if (delta > 0) {
			delta = min(delta, 8 - fit.dist[to]);
			var f1d = min(delta >> 1, fit.dist[f1]);
			var f2d = min(delta >> 1, fit.dist[f2]);
			var rd = delta - f1d - f2d;
			if (fit.dist[f2] > fit.dist[f1]) f2d += rd; else f1d += rd;
			fit.dist[to] += delta;
			fit.dist[f1] -= f1d;
			fit.dist[f2] -= f2d;
		}
		if (fit === current.fit)
			updateUIFitPowerDist();
		return true;
	}; // changeFitPowerDist()
	
	
	var isShipIDSlotModuleIDValid = function(sID, group, slot, mID) {
		var ship = eddb.ship[sID];
		if (!ship) return false; // ship does not exist
		if (group === 'ship') return ((slot === 'hull' && mID === sID) || (slot === 'hatch' && mID === SHIP_HATCH_ID)); // ship pseudogroup can only contain hull or cargo hatch
		if (!ship.slots[group] || ship.slots[group].length <= slot) return false; // group or slot does not exist
		if (!mID) return (group !== 'component'); // core components cannot be empty
		var module = eddb.module[mID];
		if (!module) return false; // module does not exist
		if (!((group === 'component') ? eddb.group.component[slot] : eddb.group[group]).mtypes[module.mtype]) return false; // group does not allow the module type
		return true;
	}; // isShipIDSlotModuleIDValid()
	
	
	var isShipIDSlotModuleIDAllowed = function(sID, group, slot, mID) {
		if (!isShipIDSlotModuleIDValid(sID, group, slot, mID)) return false;
		if (group === 'ship') return ((slot === 'hull' && mID === sID) || (slot === 'hatch' && mID === SHIP_HATCH_ID)); // ship pseudogroup can only contain hull or cargo hatch
		if (!mID) return (group !== 'component'); // core components cannot be empty
		var ship = eddb.ship[sID];
		var module = eddb.module[mID];
		if (module.class > ship.slots[group][slot]) return false; // module is too large for the slot
		if (module.class < ship.slots[group][slot] && (module.mtype === 'cls' || module.mtype === 'cs')) return false; // module is too small for the slot (i.e. life support, sensors)
		if (module.reserved && !module.reserved[sID]) return false; // module does not allow the ship (i.e. fighter hangars, luxury cabins)
		if (ship.reserved && ship.reserved[group] && ship.reserved[group][slot] && !ship.reserved[group][slot][module.mtype]) return false; // slot does not allow the module type (i.e. Beluga/Orca/Dolphin cabins-only slots)
		return true;
	}; // isShipIDSlotModuleIDAllowed()
	
	
	var isShipIDSlotModuleIDEnough = function(sID, group, slot, mID) {
		if (!isShipIDSlotModuleIDAllowed(sID, group, slot, mID)) return false;
		if (group === 'ship') return ((slot === 'hull' && mID === sID) || (slot === 'hatch' && mID === SHIP_HATCH_ID)); // ship pseudogroup can only contain hull or cargo hatch
		if (!mID) return (group !== 'component'); // core components cannot be empty
		var ship = eddb.ship[sID];
		var module = eddb.module[mID];
		if ((module.mtype === 'ct' || module.mtype === 'isg') && ship.mass > module.maxmass) return false; // ship mass exceeds thruster/shieldgen maximum
		if (module.mtype === 'cpd' && ship.boostcost + BOOST_MARGIN > module.engcap) return false; // ship boost cost exceeds distributor capacity
		return true;
	}; // isShipIDSlotModuleIDEnough()
	
	
	var setFitSlotModuleID = function(fit, group, slot, mID) {
		if (!fit || !GROUP_LABEL[group] || !(current.option.experimental ? isShipIDSlotModuleIDValid(fit.ship.hull.id, group, slot, mID) : isShipIDSlotModuleIDAllowed(fit.ship.hull.id, group, slot, mID)))
			return false;
		var obj = fit[group][slot];
		obj.id = (mID || 0);
		obj.blueprint = null;
		obj.grade = 0;
		obj.expeffect = null;
		obj.modifier = null;
		obj.data = (mID ? clone({}, eddb.module[mID]) : null);
		if (mID && fit.ship.hull.data.module[mID]) {
			clone(obj.data, fit.ship.hull.data.module[mID]);
		}
		updateFitSlotAttributes(fit, group, slot);
		if (fit === current.fit)
			updateUIFitSlot(group, slot);
		return true;
	}; // setFitSlotModuleID()
	
	
	var swapFitSlotModules = function(fit, group1, slot1, group2, slot2) {
		if (!fit || !GROUP_LABEL[group1] || !GROUP_LABEL[group2])
			return false;
		var obj1 = fit[group1][slot1];
		var obj2 = fit[group2][slot2];
		if (!obj1 || !obj2)
			return false;
		if (current.option.experimental) {
			if (!isShipIDSlotModuleIDValid(fit.ship.hull.id, group1, slot1, obj2.id) || !isShipIDSlotModuleIDValid(fit.ship.hull.id, group2, slot2, obj1.id))
				return false;
		} else {
			if (!isShipIDSlotModuleIDAllowed(fit.ship.hull.id, group1, slot1, obj2.id) || !isShipIDSlotModuleIDAllowed(fit.ship.hull.id, group2, slot2, obj1.id))
				return false;
		}
		fit[group1][slot1] = obj2;
		fit[group2][slot2] = obj1;
		updateFitSlotAttributes(fit, group1, slot2);
		updateFitSlotAttributes(fit, group2, slot2);
		if (fit === current.fit) {
			updateUIFitSlot(group1, slot1);
			updateUIFitSlot(group2, slot2);
		}
		return true;
	}; // swapFitSlotModules()
	
	
	var setFitSlotPowered = function(fit, group, slot, powered) {
		if (!fit || !fit[group] || !fit[group][slot])
			return false;
		fit[group][slot].powered = !!powered;
		if (fit === current.fit)
			updateUIFitSlot(group, slot);
		return true;
	}; // setFitSlotPowered()
	
	
	var setFitSlotPriority = function(fit, group, slot, priority) {
		if (!fit || !fit[group] || !fit[group][slot])
			return false;
		fit[group][slot].priority = min(max(priority | 0, 1), 5);
		if (fit === current.fit)
			updateUIFitSlot(group, slot);
		return true;
	}; // setFitSlotPriority()
	
	
	var changeFitSlotPriority = function(fit, group, slot, delta) {
		if (!fit || !fit[group] || !fit[group][slot])
			return false;
		return setFitSlotPriority(fit, group, slot, (((fit[group][slot].priority + (delta || 1) - 1) % 5) + 1));
	}; // changeFitSlotPriority()
	
	
	var getAttrCombinedModifier = function(attr, modifier1, modifier2) {
		var attribute = eddb.attribute[attr];
		if (attribute.modset)
			return modifier2;
		if (attribute.modadd)
			return modifier1 + modifier2;
		// modmod and standard
		return ((1 + modifier1) * (1 + modifier2) - 1);
	}; // getAttrCombinedModifier()
	
	
	var getFitSlotAttrEffectiveModifier = function(fit, group, slot, attr) {
		// fetch base modifier
		var fitslot = fit[group][slot];
		var modifier = ((fitslot.modifier || EMPTY_OBJ)[attr] || 0);
		
		// apply related modifier
		var modifier2 = 0;
		switch (attr) {
		case 'rof':
			modifier2 = (1 / (1 + getFitSlotAttrEffectiveModifier(fit, group, slot, 'bstint'))) - 1; // TODO bstsize,bstrof
			break;
			
		case 'dps':
			modifier2 = getFitSlotAttrEffectiveModifier(fit, group, slot, 'damage');
			modifier2 = getAttrCombinedModifier(attr, modifier2, getFitSlotAttrEffectiveModifier(fit, group, slot, 'rof'));
			modifier2 = getAttrCombinedModifier(attr, modifier2, getFitSlotAttrEffectiveModifier(fit, group, slot, 'rounds'));
			break;
			
		case 'shotspd':
			modifier2 = max(0, getFitSlotAttrEffectiveModifier(fit, group, slot, 'maxrng'));
			break;
			
		case 'minmass':
		case 'maxmass':
			modifier2 = getFitSlotAttrEffectiveModifier(fit, group, slot, 'optmass');
			break;
			
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
			modifier2 = getFitSlotAttrEffectiveModifier(fit, group, slot, 'optmul');
			break;
		}
		if (modifier2) {
			modifier = getAttrCombinedModifier(attr, modifier, modifier2);
		}
		
		// apply experimental modifier
		var modifier3 = ((eddb.expeffect[fitslot.expeffect] || EMPTY_OBJ)[attr] || 0);
		if (modifier3) {
			var attribute = eddb.attribute[attr];
			modifier = getAttrCombinedModifier(attr, modifier, modifier3 / ((attribute.modset || attribute.modadd) ? 1 : (attribute.modmod || 100)));
		}
		
		return modifier;
	}; // getFitSlotAttrEffectiveModifier()
	
	
	var updateFitSlotAttributes = function(fit, group, slot) {
		var fitslot = fit[group][slot];
		if (!fitslot.id)
			return false;
		var expeffect = eddb.expeffect[fitslot.expeffect];
		var attrs = eddb.mtype[fitslot.data.mtype].modifiable;
		if (attrs) {
			for (var a = 0;  a < attrs.length;  a++) {
				var attr = attrs[a];
				var modifier = ((fitslot.modifier || EMPTY_OBJ)[attr] || 0);
				if (expeffect && expeffect[attr]) {
					if (eddb.attribute[attr].modset) {
						modifier = expeffect[attr];
					} else if (eddb.attribute[attr].modadd) {
						modifier += expeffect[attr];
					} else { // modmod and standard
						modifier = (1 + modifier) * (1 + (expeffect[attr] / (eddb.attribute[attr].modmod || 100))) - 1;
					}
				}
				fitslot.data[attr] = getModuleIDAttrValue(fitslot.id, attr, modifier);
			}
		}
		return true;
	}; // updateFitSlotAttributes()
	
	
	var setFitSlotBlueprint = function(fit, group, slot, bpid, grade) {
		if (!fit || !fit[group] || !fit[group][slot] || !fit[group][slot].id || (bpid && !eddb.blueprint[bpid]))
			return false;
		if (bpid) {
			var mtype = fit[group][slot].data.mtype || '';
			if (!eddb.mtype[mtype] || !eddb.mtype[mtype].blueprints || eddb.mtype[mtype].blueprints.indexOf(bpid) < 0)
				return false;
			if (!grade) {
				grade = (fit[group][slot].blueprint ? (
					(fit[group][slot].grade / eddb.blueprint[fit[group][slot].blueprint].maxgrade * eddb.blueprint[bpid].maxgrade + 0.5) | 0
				) : eddb.blueprint[bpid].maxgrade);
			}
			fit[group][slot].blueprint = bpid;
			fit[group][slot].grade = min(max(grade, 1), eddb.blueprint[bpid].maxgrade);
		} else {
			fit[group][slot].blueprint = null;
			fit[group][slot].grade = 0;
		}
		if (fit === current.fit)
			updateUIBlueprint();
		return true;
	}; // setFitSlotBlueprint()
	
	
	var setFitSlotBlueprintGrade = function(fit, group, slot, grade) {
		if (!fit || !fit[group] || !fit[group][slot] || !fit[group][slot].id || !fit[group][slot].blueprint)
			return false;
		fit[group][slot].grade = min(max(grade, 1), eddb.blueprint[fit[group][slot].blueprint].maxgrade);
		if (fit === current.fit)
			updateUIBlueprint();
		return true;
	}; // setFitSlotBlueprintGrade()
	
	
	var setFitSlotExpEffect = function(fit, group, slot, exid) {
		if (!fit || !fit[group] || !fit[group][slot] || !fit[group][slot].id || (exid && !eddb.expeffect[exid]))
			return false;
		if (exid) {
			var mtype = fit[group][slot].data.mtype || '';
			if (!eddb.mtype[mtype] || !eddb.mtype[mtype].expeffects || eddb.mtype[mtype].expeffects.indexOf(exid) < 0)
				return false;
			fit[group][slot].expeffect = exid;
		} else {
			fit[group][slot].expeffect = null;
		}
		updateFitSlotAttributes(fit, group, slot);
		if (fit === current.fit) {
			updateUIFitSlot(group, slot);
			if (current.outfitting_focus === 'slot' && current.group === group && current.slot === slot)
				updateUIDetailsAttrs();
		}
		return true;
	}; // setFitSlotExpEffect()
	
	
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
	
	
	var getModuleIDAttrModificationIndex = function(mID, attr) {
		var module = eddb.module[mID];
		var attribute = eddb.attribute[attr];
		if (!module || !eddb.mtype[module.mtype].modifiable)
			return -1;
		var value = ((attr in module) ? module[attr] : attribute.default);
		if (isNaN(value) || (value == 0 && !attribute.modset && !attribute.modadd && !attribute.modmod))
			return -1;
		return eddb.mtype[module.mtype].modifiable.indexOf(attr);
	}; // getModuleIDAttrModificationIndex()
	
	
	var isModuleIDAttrModifiable = function(mID, attr) {
		return (getModuleIDAttrModificationIndex(mID, attr) >= 0);
	}; // isModuleIDAttrModifiable()
	
	
	var getModuleIDAttrValue = function(mID, attr, modifier) {
		var module = eddb.module[mID];
		var attribute = eddb.attribute[attr];
		if (!module || !attribute)
			return module;
		if (attr === 'rof') {
			var bstsize = getModuleIDAttrValue(mID, 'bstsize');
			var bstrof = getModuleIDAttrValue(mID, 'bstrof');
			var bstint = getModuleIDAttrValue(mID, 'bstint');
			var rof = bstsize / ((bstsize - 1) / bstrof + bstint);
			if (modifier && isFinite(rof))
				rof *= (1 + modifier);
			return rof;
		} else if (attr === 'dps') {
			var rof = getModuleIDAttrValue(mID, 'rof');
			var damage = getModuleIDAttrValue(mID, 'damage', modifier);
			var rounds = getModuleIDAttrValue(mID, 'rounds');
			return (damage * (isFinite(rof) ? rof : 1.0) * rounds);
		}
		var base = module[attr];
		if (typeof base === 'undefined') {
			if (isNaN(attribute.default) && !isNaN(attribute.scale))
				return getModuleIDAttrValue(mID, attribute.default, modifier);
			base = attribute.default;
		}
		if ((typeof modifier === 'undefined') || isNaN(base) || (base == 0 && !attribute.modset && !attribute.modadd && !attribute.modmod))
			return base;
		if (attribute.modset) {
			var value = modifier;
		} else if (attribute.modadd) {
			var value = base + modifier;
		} else if (attribute.modmod) {
			var value = ((1 + (base / attribute.modmod)) * (1 + modifier) - 1) * attribute.modmod;
		} else {
			var value = base * (1 + modifier);
		}
		if (attribute.step)
			value = round(value / attribute.step) * attribute.step;
		if (typeof attribute.min !== 'undefined')
			value = max(value, attribute.min);
		if (typeof attribute.max !== 'undefined')
			value = min(value, attribute.max);
		return value;
	}; // getModuleIDAttrValue()
	
	
	var getModuleIDAttrModifierDirection = function(mID, attr, modifier) {
		if (isNaN(modifier))
			return 0;
		return (modifier * (eddb.attribute[attr].modmod || 1) * (eddb.attribute[attr].bad ? -1 : 1));
	}; // getModuleIDAttrModifierDirection()
	
	
	var getModuleIDAttrValueAsText = function(mID, attr, value) {
		if (isNaN(value) || !isFinite(value)) {
			return value;
		}
		var attribute = eddb.attribute[attr];
		if (attribute.step) {
			var step = attribute.step;
		} else if (attribute.modset || attribute.modadd) {
			var step = 1 / (1 << 14);
		} else if (attribute.modmod) {
			var step = abs(attribute.modmod) / (1 << 14);
		} else {
			var step = (getModuleIDAttrValue(mID, attr) || 1) / (1 << 14);
		}
		var decimals = -ceil(log(step) / LN10 - 0.000001);
		if (decimals > 0) {
			var text = value.toFixed(decimals).replace(/(\.[0-9]*?[1-9])0+$/, '$1').replace(/\.0*$/, '');
		} else {
			var step = pow(10, -decimals);
			var text = (((value / step + 0.5) | 0) * step).toFixed(0);
		}
		return text;
	}; // getModuleIDAttrValueAsText()
	
	
	var getModuleIDAttrModifierAsText = function(mID, attr, modifier) {
		var text = '';
		var base = getModuleIDAttrValue(mID, attr);
		var value = getModuleIDAttrValue(mID, attr, modifier);
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
	}; // getModuleIDAttrModifierAsText()
	
	
	/*
	* CACHE & UI INIT
	*/
	
	
	var initShipyard = function() {
		var sortShips = function(s1,s2) {
			var v1 = eddb.ship[s1].name;
			var v2 = eddb.ship[s2].name;
			return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
		}; // sortShips()
		
		var sortNumbersDesc = function(n1,n2) {
			return n2 - n1;
		}; // sortNumbersDesc()
		
		
		cache.ships = Object.keys(eddb.ship);
		cache.ships.sort(sortShips);
		
		var table = document.createElement('table');
		table.id = 'shipyard_table';
		
		var thead = document.createElement('thead');
		var tr = document.createElement('tr');
		
		var th = document.createElement('th');
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Ship';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Price';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tac';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Sz';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Crw';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'MLF';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Mass';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Spd';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Bst';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Shd';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Arm';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Hrd';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Crgo';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tar';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Psgr';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Hardpoints';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		th.className = 'tac';
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Utl';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		for (var slot = 1;  slot < eddb.group.component.length;  slot++) {
			var th = document.createElement('th');
			th.className = 'tac';
			var abbr = document.createElement('abbr');
			abbr.innerHTML = CORE_SLOT_ABBR[slot];
			th.appendChild(abbr);
			tr.appendChild(th);
		}
		
		var th = document.createElement('th');
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Mil';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		var th = document.createElement('th');
		var abbr = document.createElement('abbr');
		abbr.innerHTML = 'Opt Internal';
		th.appendChild(abbr);
		tr.appendChild(th);
		
		thead.appendChild(tr);
		table.appendChild(thead);
		
		var tbody = document.createElement('tbody');
		for (var s = 0;  s < cache.ships.length;  s++) {
			var ship = eddb.ship[cache.ships[s]];
			var tr = document.createElement('tr');
			tr.id = 'shipyard_ship_' + cache.ships[s];
			
			var td = document.createElement('td');
			td.innerHTML = ship.name;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ship.retail;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tac';
			td.innerHTML = '?SML'[ship.class || 0];
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ship.crew;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ship.masslock;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ship.mass;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ship.topspd;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ship.bstspd;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ship.shields;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ship.armour;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ship.hardness;
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ''; // TODO cargo
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tar';
			td.innerHTML = ''; // TODO psgr
			tr.appendChild(td);
			
			var sizes = ship.slots.hardpoint.slice(0);
			sizes.sort(sortNumbersDesc);
			var i = sizes.length;
			while (i-- > 0) {
				sizes[i] = '?SMLH'[sizes[i] || 0];
			}
			var td = document.createElement('td');
			td.innerHTML = sizes.join(' ');
			tr.appendChild(td);
			
			var td = document.createElement('td');
			td.className = 'tac';
			td.innerHTML = ship.slots.utility.length;
			tr.appendChild(td);
			
			for (var slot = 1;  slot < eddb.group.component.length;  slot++) {
				var td = document.createElement('td');
				td.className = 'tac';
				td.innerHTML = ship.slots.component[slot];
				tr.appendChild(td);
			}
			
			var sizes = ship.slots.military.slice(0);
			sizes.sort(sortNumbersDesc);
			var td = document.createElement('td');
			td.innerHTML = sizes.join(' ');
			tr.appendChild(td);
			
			var sizes = ship.slots.internal.slice(0);
			sizes.sort(sortNumbersDesc);
			var td = document.createElement('td');
			td.innerHTML = sizes.join(' ');
			tr.appendChild(td);
			
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		
		document.getElementById('shipyard_container').appendChild(table);
	}; // initShipyard()
	
	
	var initModules = function() {
		var sortMtypes = function(t1,t2) {
			var v1 = eddb.mtype[t1].name;
			var v2 = eddb.mtype[t2].name;
			return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
		}; // sortMtypes()
		
		var sortModules = function(i1,i2) {
			var m1 = eddb.module[i1];
			var m2 = eddb.module[i2];
			// by class (size)
			var v1 = 0 + (m1.class || 0);
			var v2 = 0 + (m2.class || 0);
			if (v1 != v2) return v1 - v2;
			// by uniqueness
			v1 = 0 + !(eddb.mtype[mtype].modulenames[m1.name]);
			v2 = 0 + !(eddb.mtype[mtype].modulenames[m2.name]);
			if (v1 != v2) return v1 - v2;
			// if same-name, by mount type (F-G-T)
			if (m1.name == m2.name) {
				v1 = 0 + (m1.mount || ' ').charCodeAt(0);
				v2 = 0 + (m2.mount || ' ').charCodeAt(0);
				if (v1 != v2) return v1 - v2;
			}
			// if non-unique, ...
			if (eddb.mtype[mtype].modulenames[m1.name]) {
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
		
		// identify and sort mtypes for each group
		cache.groupMtypes = {};
		cache.mtypeModules = {};
		for (var g = 0;  g < GROUPS.length;  g++) {
			var group = GROUPS[g];
			cache.groupMtypes[group] = [];
			if (group == 'component') {
				for (var s = 0;  s < eddb.group.component.length;  s++) {
					for (var mtype in eddb.group.component[s].mtypes) {
						// display fuel tanks under internals so they appear in the right place in both filters
						if (mtype == 'cft') continue;
						cache.groupMtypes[group].push(mtype);
						cache.mtypeModules[mtype] = [];
					}
				}
			} else if (group == 'military') {
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
		for (var mID in eddb.module) {
			var mtype = eddb.module[mID].mtype;
			if (cache.mtypeModules[mtype]) {
				cache.mtypeModules[mtype].push(mID);
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
	}; // initModules()
	
	
	var initEngineering = function() {
		var sortBlueprints = function(b1,b2) {
			var v1 = eddb.blueprint[b1].name;
			var v2 = eddb.blueprint[b2].name;
			return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
		}; // sortBlueprints()
		
		var sortExpeffects = function(e1,e2) {
			var v1 = eddb.expeffect[e1].name;
			var v2 = eddb.expeffect[e2].name;
			return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
		}; // sortExpeffects()
		
		cache.mtypeBlueprints = {};
		cache.mtypeExpeffects = {};
		for (var mtype in cache.mtypeModules) {
			if (eddb.mtype[mtype].blueprints) {
				cache.mtypeBlueprints[mtype] = [];
				for (var i = 0;  i < eddb.mtype[mtype].blueprints.length;  i++) {
					cache.mtypeBlueprints[mtype].push(eddb.mtype[mtype].blueprints[i]);
				}
				cache.mtypeBlueprints[mtype].sort(sortBlueprints);
			}
			if (eddb.mtype[mtype].expeffects) {
				cache.mtypeExpeffects[mtype] = [];
				for (var i = 0;  i < eddb.mtype[mtype].expeffects.length;  i++) {
					cache.mtypeExpeffects[mtype].push(eddb.mtype[mtype].expeffects[i]);
				}
				cache.mtypeExpeffects[mtype].sort(sortExpeffects);
			}
		}
	}; // initEngineering()
	
	
	var initUIModulePicker = function() {
		// build picker DOM
		var divPicker = document.createElement('div');
		divPicker.id = 'outfitting_modules_picker';
		for (var g = 0;  g < GROUPS.length;  g++) {
			var group = GROUPS[g];
			if (!cache.groupMtypes[group] || cache.groupMtypes[group].length < 1)
				continue;
			var fakeGroupStored = (Math.random() < 0.66); // TODO
			
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
		span.className = 'outfitting_fit_power';
		span.appendChild(document.createTextNode(tag.substr(1).toUpperCase()));
		button.appendChild(span);
		return button;
	}; // createUIFitPowerDistButton()
	
	
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
			var label = document.createElement('label');
			label.className = 'togglebutton';
			label.draggable = true;
			var input = document.createElement('input');
			input.type = 'radio';
			input.name = 'slot';
			input.value = group_slot;
			var div = document.createElement('div');
			div.id = 'outfitting_fit_name_' + group_slot;
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
				var label = document.createElement('label');
				label.className = 'checkbox';
				var span = document.createElement('span');
				span.id = 'outfitting_fit_power_' + group_slot;
				span.className = 'outfitting_fit_power';
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
	
	
	var initUIFitSlots = function() {
		var tableLeft = document.createElement('table');
		tableLeft.id = 'outfitting_fit_left';
		tableLeft.appendChild(createUIFitHeader());
		
		var tbody = document.createElement('tbody');
		tbody.id = 'outfitting_fit_ship_hull';
		tbody.appendChild(createUIFitSlotRow('ship', 'hull'));
		tableLeft.appendChild(tbody);
		
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
		
		var div = document.createElement('div');
		div.className = 'slots_column';
		div.appendChild(tableLeft);
		document.getElementById('outfitting_fit_slots').appendChild(div);
		
		var div = document.createElement('div');
		div.className = 'slots_column';
		div.appendChild(tableRight);
		document.getElementById('outfitting_fit_slots').appendChild(div);
	}; // initUIFitSlots()
	
	
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
	
	
	var initUIDetails = function() {
		var table = document.createElement('table');
		table.id = 'outfitting_details_table';
		
		var tbody = document.createElement('tbody');
		tbody.id = 'outfitting_details_attrs';
		addUIDetailsAttrRow(tbody);
		table.appendChild(tbody);
		
		document.getElementById('outfitting_details_module').appendChild(table);
	}; // initUIDetails()
	
	
	var sortAttributes = function(a1, a2) {
		var v1 = eddb.attribute[a1].order;
		var v2 = eddb.attribute[a2].order;
		if (v1 != v2) return v1 - v2;
		v1 = eddb.attribute[a1].name;
		v2 = eddb.attribute[a2].name;
		if (v1 != v2) return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
		v1 = a1;
		v2 = a2;
		return (v1 < v2) ? -1 : ((v1 > v2) ? 1 : 0);
	}; // sortAttributes()
	
	
	/*
	* UI INTERACTION
	*/
	
	
	var setUIPageTab = function(tab) {
		current.page = tab;
		document.forms.header.elements.tab.value = tab;
		document.getElementById('page_body').className = tab;
	}; // setUIPageTab()
	
	
	var setUIShipyardTab = function(tab) {
		current.shipyard_tab = tab;
		document.forms.shipyard.elements.tab.value = tab;
		document.forms.shipyard.className = tab;
	}; // setUIShipyardTab()
	
	
	var setUIModuleTab = function(tab) {
		current.tab = tab;
		document.forms.modules.elements.tab.value = tab;
		document.forms.modules.className = tab;
	}; // setUIModuleTab()
	
	
	var setUIPickerModule = function(mID, scroll) {
		var input = document.getElementById('outfitting_module_' + (mID || document.forms.modules.elements.module.value));
		if (!input)
			return false;
		if (mID) {
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
	
	
	var updateUIFitColumns = function() {
		document.getElementById('outfitting_fit_slots').className = (
			(document.forms.fit.elements.outfitting_show_mass.checked ? '' : 'no') + 'mass ' +
			(document.forms.fit.elements.outfitting_show_power.checked ? '' : 'no') + 'power ' +
			(document.forms.fit.elements.outfitting_show_price.checked ? '' : 'no') + 'price'
		);
	}; // updateUIFitColumns()
	
	
	var updateUIFitShip = function() {
		var ship = current.fit.ship.hull.data;
		
		// set ship attributes
		document.getElementById('outfitting_fit_class_ship_hull').innerHTML = '?SML'[ship.class || 0];
		document.getElementById('outfitting_fit_name_ship_hull').innerHTML = ship.name;
		document.getElementById('outfitting_fit_mass_ship_hull').innerHTML = ship.mass.toFixed(2);
		document.getElementById('outfitting_fit_price_ship_hull').innerHTML = ship.cost.toFixed(0);
		
		// mark undersized modules
		for (var m = 0;  m < cache.mtypeModules['ct'].length;  m++) {
			var mID = cache.mtypeModules['ct'][m];
			document.getElementById('outfitting_module_' + mID).className = ((eddb.module[mID].maxmass < ship.mass) ? 'notenough' : '');
		}
		for (var m = 0;  m < cache.mtypeModules['cpd'].length;  m++) {
			var mID = cache.mtypeModules['cpd'][m];
			document.getElementById('outfitting_module_' + mID).className = ((eddb.module[mID].engcap < (ship.boostcost + BOOST_MARGIN)) ? 'notenough' : '');
		}
		for (var m = 0;  m < cache.mtypeModules['isg'].length;  m++) {
			var mID = cache.mtypeModules['isg'][m];
			document.getElementById('outfitting_module_' + mID).className = ((eddb.module[mID].maxmass < ship.mass) ? 'notenough' : '');
		}
		
		// mark reserved modules
		for (var m = 0;  m < cache.mtypeModules['ifh'].length;  m++) {
			var mID = cache.mtypeModules['ifh'][m];
			if (eddb.module[mID].reserved) {
				document.getElementById('outfitting_module_' + mID).className = (eddb.module[mID].reserved[current.fit.ship.hull.id] ? '' : 'notallowed');
			}
		}
		for (var m = 0;  m < cache.mtypeModules['ipc'].length;  m++) {
			var mID = cache.mtypeModules['ipc'][m];
			if (eddb.module[mID].reserved) {
				document.getElementById('outfitting_module_' + mID).className = (eddb.module[mID].reserved[current.fit.ship.hull.id] ? '' : 'notallowed');
			}
		}
		
		// create or update slot rows
		for (var g = 0;  g < GROUPS.length;  g++) {
			var group = GROUPS[g];
			var tbody = document.getElementById('outfitting_fit_' + group);
			var tr;
			var slot = 0;
			while (slot < ship.slots[group].length) {
				if (!(tr = tbody.rows[slot + 1])) {
					tbody.appendChild(tr = createUIFitSlotRow(group, slot));
				}
				tr.style.display = '';
				var html = ((group == 'hardpoint') ? 'USMLH'[ship.slots[group][slot] || 0] : (ship.slots[group][slot] || ''));
				if (ship.reserved && ship.reserved[group] && ship.reserved[group][slot]) {
					html = '<abbr title="This slot is restricted to specific module types.">' + html + '*</abbr>';
				}
				document.getElementById('outfitting_fit_class_' + group + '_' + slot).innerHTML = html;
				slot++;
			}
			if (slot == 0) {
				tbody.style.display = 'none';
			} else {
				tbody.style.display = '';
				while (tr = tbody.rows[++slot]) {
					tr.style.display = 'none';
				}
			}
		}
	}; // updateUIFitShip()
	
	
	var updateUIFitPowerDist = function() {
		document.getElementById('outfitting_fit_powerdist_sys').className = 'dist' + current.fit.dist.sys;
		document.getElementById('outfitting_fit_powerdist_eng').className = 'dist' + current.fit.dist.eng;
		document.getElementById('outfitting_fit_powerdist_wep').className = 'dist' + current.fit.dist.wep;
	}; // updateUIFitPowerDist()
	
	
	var updateUIFitSlot = function(group, slot) {
		var fitslot = current.fit[group][slot];
		var group_slot = group + '_' + slot;
		document.getElementById('outfitting_fit_module_' + group_slot).className = (
			isShipIDSlotModuleIDAllowed(current.fit.ship.hull.id, group, slot, fitslot.id) ? (
				isShipIDSlotModuleIDEnough(current.fit.ship.hull.id, group, slot, fitslot.id) ? '' : 'notenough'
			) : 'notallowed'
		);
		document.getElementById('outfitting_fit_name_' + group_slot).innerHTML = (fitslot.data ? (
			getModuleLabel(fitslot.data, false, true) + (fitslot.modifier ? '<span class="icon engineer"></span>' : '')
		) : '<span>(empty)</span>');
		document.getElementById('outfitting_fit_mass_' + group_slot).innerHTML = (fitslot.data && fitslot.data.mass) ? fitslot.data.mass.toFixed(2) : '';
		if (fitslot.data && fitslot.data.pwrdraw) {
			document.getElementById('outfitting_fit_powercheck_' + group_slot).style.visibility = 'visible';
			document.getElementById('outfitting_fit_power_' + group_slot).innerHTML = '-' + fitslot.data.pwrdraw.toFixed(2);
			document.getElementById('outfitting_fit_powered_' + group_slot).checked = fitslot.powered;
			document.getElementById('outfitting_fit_priority_' + group_slot).style.visibility = 'visible';
			document.getElementById('outfitting_fit_priority_' + group_slot).innerHTML = fitslot.priority;
		} else {
			document.getElementById('outfitting_fit_powercheck_' + group_slot).style.visibility = 'hidden';
			document.getElementById('outfitting_fit_power_' + group_slot).innerHTML = ((fitslot.data && fitslot.data.pwrcap) ? ('+' + fitslot.data.pwrcap.toFixed(2)) : '');
			document.getElementById('outfitting_fit_priority_' + group_slot).style.visibility = 'hidden';
		}
		document.getElementById('outfitting_fit_price_' + group_slot).innerHTML = (fitslot.data && fitslot.data.cost) ? fitslot.data.cost.toFixed(0) : '';
	}; // updateUIFitSlot()
	
	
	var setCurrentFit = function(fit) {
		current.fit = fit;
		updateUIFitShip();
		updateUIFitPowerDist();
		updateUIFitSlot('ship', 'hatch');
		for (var group in GROUP_LABEL) {
			for (var slot = 0;  slot < fit[group].length;  slot++) {
				updateUIFitSlot(group, slot);
			}
		}
		setCurrentSlot('ship', 'hull');
	}; // setCurrentFit()
	
	
	var setCurrentSlot = function(group, slot) {
		current.outfitting_focus = 'slot';
		current.group = group;
		current.slot = slot;
		var shipdata = current.fit.ship.hull.data;
		var reserved = shipdata.reserved && shipdata.reserved[group] && shipdata.reserved[group][slot];
		document.getElementById('page_body_outfitting').className = current.outfitting_focus;
		document.getElementById('outfitting_modules_picker').className = (
			group +
			((group === 'component') ? (' component_' + CORE_SLOT_ABBR[slot]) : '') +
			(GROUP_LABEL[group] ? (' size' + shipdata.slots[group][slot]) : ('_' + slot)) +
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
		if (GROUP_LABEL[group]) {
			setUIPickerModule(current.fit[group][slot].id, current.tab === 'SLOT');
		} else {
			setUIPickerModule(0);
		}
		document.forms.fit.elements.slot.value = group + '_' + slot;
		updateUIDetailsModule();
	}; // setCurrentSlot()
	
	
	var setCurrentFitSlotModuleID = function(group, slot, mID) {
		if (setFitSlotModuleID(current.fit, group, slot, mID)) {
			setCurrentSlot(group, slot);
		}
	}; // setCurrentFitSlotModuleID()
	
	
	var swapCurrentFitSlotModules = function(group1, slot1, group2, slot2) {
		if (swapFitSlotModules(current.fit, group1, slot1, group2, slot2)) {
			setCurrentSlot(group2, slot2);
		}
	}; // swapCurrentFitSlotModules()
	
	
	var setCurrentFitSlotPowered = function(group, slot, powered) {
		setFitSlotPowered(current.fit, group, slot, powered);
	}; // setCurrentFitSlotPowered()
	
	
	var changeCurrentFitSlotPriority = function(group, slot, delta) {
		changeFitSlotPriority(current.fit, group, slot, delta);
	}; // changeCurrentFitSlotPriority()
	
	
	var setCurrentDrag = function(mID, fromgroup, fromslot) {
		current.drag = (mID ? { id:mID, group:fromgroup, slot:fromslot } : null);
		if (mID && fromgroup) {
			document.getElementById('outfitting_modules_container').addEventListener('dragenter', onUIModulePickerDragEnter);
			document.getElementById('outfitting_modules_container').addEventListener('dragover', onUIModulePickerDragOver);
			document.getElementById('outfitting_modules_container').addEventListener('dragleave', onUIModulePickerDragLeave);
		} else {
			document.getElementById('outfitting_modules_container').removeEventListener('dragenter', onUIModulePickerDragEnter);
			document.getElementById('outfitting_modules_container').removeEventListener('dragover', onUIModulePickerDragOver);
			document.getElementById('outfitting_modules_container').removeEventListener('dragleave', onUIModulePickerDragLeave);
		}
		document.getElementById('outfitting_fit_ship_hull').className = (mID ? 'dragerror' : '');
		document.getElementById('outfitting_fit_ship_hatch').className = (mID ? 'dragerror' : '');
		for (var group in GROUP_LABEL) {
			var tr;
			for (var slot = 0;  tr = document.getElementById('outfitting_fit_slot_' + group + '_' + slot);  slot++) {
				if (!mID) {
					tr.className = '';
					tr.removeEventListener('dragenter', onUIFitSlotsDragEnter);
					tr.removeEventListener('dragover', onUIFitSlotsDragOver);
					tr.removeEventListener('dragleave', onUIFitSlotsDragLeave);
				} else if (!(current.option.experimental ? isShipIDSlotModuleIDValid(current.fit.ship.hull.id, group, slot, mID) : isShipIDSlotModuleIDAllowed(current.fit.ship.hull.id, group, slot, mID))) {
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
	
	
	var setDOMSelectLength = function(select, length) {
		while (select.length < length)
			select.options.add(document.createElement('option'));
		while (select.length > length)
			select.options.remove(select.options.length - 1);
	}; // setDOMSelectLength()
	
	
	var updateUIDetailsModule = function() {
		var fitslot = null;
		var mID = 0;
		var itemdata = null;
		var modifiable = false;
		if (current.outfitting_focus === 'module') {
			mID = document.forms.modules.elements.module.value;
			var ship = current.fit.ship.hull.data;
			itemdata = (ship.module[mID] ? clone(clone({}, eddb.module[mID]), ship.module[mID]) : eddb.module[mID]);
		} else if (current.outfitting_focus === 'slot') {
			fitslot = current.fit[current.group][current.slot];
			mID = fitslot.id;
			itemdata = fitslot.data;
			modifiable = itemdata && eddb.mtype[itemdata.mtype] && eddb.mtype[itemdata.mtype].modifiable;
		}
		
		document.getElementById('outfitting_details_module').style.visibility = (itemdata ? 'visible' : 'hidden');
		if (!itemdata)
			return;
		
		// set displayed label
		document.getElementById('outfitting_details_label').innerHTML = (itemdata.mtype ? getModuleLabel(itemdata, false, true) : itemdata.name);
		
		// update blueprint selector
		var select = document.forms.details.elements.blueprint;
		var idlist = cache.mtypeBlueprints[itemdata.mtype];
		var iddata = eddb.blueprint;
		setDOMSelectLength(select, 1 + (idlist ? idlist.length : 0));
		for (var i = 0;  idlist && i < idlist.length;  i++) {
			select.options[i+1].value = idlist[i];
			select.options[i+1].text = iddata[idlist[i]].name;
		}
		select.disabled = !(modifiable && idlist);
		
		// update experimental selector
		var select = document.forms.details.elements.expeffect;
		var idlist = cache.mtypeExpeffects[itemdata.mtype];
		var iddata = eddb.expeffect;
		setDOMSelectLength(select, 1 + (idlist ? idlist.length : 0));
		for (var i = 0;  idlist && i < idlist.length;  i++) {
			select.options[i+1].value = idlist[i];
			select.options[i+1].text = iddata[idlist[i]].name;
		}
		select.disabled = !(modifiable && idlist);
		
		// set displayed blueprint and expeffect
		updateUIBlueprint();
		
		// get and sort all displayable attributes
		var attrflag = {};
		for (var attr in itemdata) {
			if (eddb.attribute[attr])
				attrflag[attr] = 1;
		}
		if (modifiable) {
			for (var i = 0;  i < modifiable.length;  i++)
				attrflag[modifiable[i]] = 1;
		}
		if (attrflag.damage) attrflag.dps = 1;
		if (attrflag.bstrof || attrflag.bstsize || attrflag.bstint) attrflag.rof = 1;
		var attrlist = Object.keys(attrflag);
		attrlist.sort(sortAttributes);
		
		// update attribute rows
		var tbody = document.getElementById('outfitting_details_attrs');
		while (tbody.rows.length < attrlist.length) {
			addUIDetailsAttrRow();
		}
		for (var r = 0;  r < attrlist.length;  r++) {
			var attr = attrlist[r];
			
			var abbr = document.getElementById('outfitting_details_abbr_' + r);
			abbr.innerHTML = eddb.attribute[attr].name;
			abbr.title = eddb.attribute[attr].desc;
			var input = document.getElementById('outfitting_details_input_' + r);
			input.name = attr;
			input.disabled = !(modifiable && isModuleIDAttrModifiable(mID, attr));
			var unit = document.getElementById('outfitting_details_unit_' + r);
			unit.innerHTML = eddb.attribute[attr].unit || '';
			
			tbody.rows[r].style.display = '';
		}
		for (var r = attrlist.length;  r < tbody.rows.length;  r++) {
			document.getElementById('outfitting_details_input_' + r).name = '_disabled_' + r;
			tbody.rows[r].style.display = 'none';
		}
		
		// set displayed attribute values
		updateUIDetailsAttrs();
	}; // updateUIDetailsModule()
	
	
	var updateUIDetailsAttrs = function() {
		var mID = 0;
		var fitslot = null;
		var itemdata = null;
		if (current.outfitting_focus === 'module') {
			var ship = current.fit.ship.hull.data;
			mID = document.forms.modules.elements.module.value;
			itemdata = (ship.module[mID] ? clone(clone({}, eddb.module[mID]), ship.module[mID]) : eddb.module[mID]);
		} else if (current.outfitting_focus === 'slot') {
			fitslot = current.fit[current.group][current.slot];
			mID = fitslot.id;
			itemdata = fitslot.data;
		}
		if (!itemdata)
			return;
		
		var input, moddisplay;
		for (var r = 0;  (input = document.getElementById('outfitting_details_input_' + r)) && eddb.attribute[input.name];  r++) {
			var attr = input.name;
			input.value = getModuleIDAttrValueAsText(mID, attr, itemdata[attr]);
			var modifier = (fitslot ? getFitSlotAttrEffectiveModifier(current.fit, current.group, current.slot, attr) : 0);
			var dir = getModuleIDAttrModifierDirection(mID, attr, modifier);
			var moddisplay = document.getElementById('outfitting_details_mod_' + r);
			moddisplay.className = (dir ? ((dir < 0) ? 'modbad' : 'modgood') : '');
			moddisplay.innerHTML = getModuleIDAttrModifierAsText(mID, attr, modifier);
		}
	}; // updateUIDetailsAttrs()
	
	
	var updateUIBlueprint = function() {
		var modifiable = false;
		var bpid = null;
		var bpgrade = 0;
		var exid = null;
		if (current.outfitting_focus === 'slot') {
			var fitslot = current.fit[current.group][current.slot];
			modifiable = (fitslot.data && eddb.mtype[fitslot.data.mtype] && eddb.mtype[fitslot.data.mtype].blueprints);
			bpid = fitslot.blueprint;
			bpgrade = fitslot.grade;
			exid = fitslot.expeffect;
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
			document.forms.details.elements.expeffect.value = (exid || '');
		} else {
			document.forms.details.elements.blueprint.selectedIndex = -1;
			document.forms.details.elements.expeffect.selectedIndex = -1;
		}
	}; // updateUIBlueprint()
	
	
	var updateUIOptions = function() {
		var classes = [];
		for (var opt in current.option) {
			if (current.option[opt] = document.forms.options.elements[opt].checked)
				classes.push(opt);
		}
		document.body.className = classes.join(' ');
	}; // updateUIOptions()
	
	
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
		if (!el) {
		} else if (el.tagName === 'TR') {
			var tokens = el.id.split('_');
			if (tokens[1] === 'ship') {
				setCurrentFit(getShipIDFit(tokens[2], true));
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
		var label = e.target;
		while (label && label.tagName !== 'LABEL' && label.tagName !== 'INPUT') {
			label = label.parentNode;
		}
		if (label && label.tagName === 'LABEL') {
			var inputs = label.getElementsByTagName('INPUT');
			if (inputs.length > 0 && inputs[0].checked && inputs[0].name === 'module') {
				current.outfitting_focus = 'module';
				document.getElementById('page_body_outfitting').className = current.outfitting_focus;
				updateUIDetailsModule();
			}
		}
	}; // onUIModulePickerClick()
	
	
	var onUIModulePickerDblClick = function(e) {
		var label = e.target;
		while (label && label.tagName !== 'LABEL' && label.tagName !== 'INPUT') {
			label = label.parentNode;
		}
		if (label && label.tagName === 'LABEL') {
			var inputs = label.getElementsByTagName('INPUT');
			if (inputs.length > 0 && inputs[0].checked && inputs[0].name === 'module') {
				setCurrentFitSlotModuleID(current.group, current.slot, inputs[0].value | 0);
			}
		}
	}; // onUIModulePickerDblClick()
	
	
	var onUIModulePickerDragStart = function(e) {
		var inputs = e.target.getElementsByTagName('INPUT');
		var mID = inputs[0].value;
		// TODO: ghost bug in chrome
		e.dataTransfer.setData('edsy/mid', mID);
		e.dataTransfer.effectAllowed = 'copy';
		setCurrentDrag(mID);
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
				changeFitPowerDist(current.fit, tokens[1], 2);
			}
		}
	}; // onUIFitSlotsClick()
	
	
	var onUIFitSlotsDblClick = function(e) {
		var label = e.target;
		while (label && label.tagName !== 'LABEL' && label.tagName !== 'INPUT') {
			label = label.parentNode;
		}
		if (label && label.tagName === 'LABEL') {
			var inputs = label.getElementsByTagName('INPUT');
			if (inputs.length > 0 && inputs[0].checked && inputs[0].name === 'slot') {
				setCurrentFitSlotModuleID(current.group, current.slot, 0);
			}
		}
	}; // onUIFitSlotsDblClick()
	
	
	var onUIFitSlotsDragStart = function(e) {
		var inputs = e.target.getElementsByTagName('INPUT');
		var tokens = inputs[0].value.split('_');
		var group = tokens[0];
		var slot = tokens[1];
		var mID = current.fit[group][slot].id;
		if (!GROUP_LABEL[group] || group === 'component' || !mID) {
			e.preventDefault();
			return;
		}
		// TODO: ghost bug in chrome
		e.dataTransfer.setData('edsy/mid', mID);
		e.dataTransfer.setData('edsy/group', group);
		e.dataTransfer.setData('edsy/slot', slot);
		e.dataTransfer.effectAllowed = 'move';
		setCurrentDrag(mID, group, slot);
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
		if (e.target.name === 'blueprint') {
			setFitSlotBlueprint(current.fit, current.group, current.slot, e.target.value);
		} else if (e.target.name === 'expeffect') {
			setFitSlotExpEffect(current.fit, current.group, current.slot, e.target.value);
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
				setFitSlotBlueprintGrade(current.fit, current.group, current.slot, 1*el.value);
			} else if (el.name === 'blueprint_roll') {
				//TODO
			}
		}
	}; // onUIDetailsModuleClick()
	
	
	var onUIOptionsChange = function(e) {
		updateUIOptions();
	}; // onUIOptionsChange()
	
	
	var onDOMContentLoaded = function(e) {
		initShipyard();
		initModules();
		initEngineering();
		initUIModulePicker();
		initUIFitSlots();
		initUIDetails();
		
		setUIPageTab('shipyard');
		setUIShipyardTab('table');
		setUIModuleTab('SLOT');
		setCurrentFit(getShipIDFit(1, true));
		updateUIFitColumns();
		updateUIOptions();
		
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
		document.getElementById('page_body_options').addEventListener('change', onUIOptionsChange);
		
		// load the donate button dynamically, so that it doesn't stop the page from loading if the remote server is slow
		/* TODO smaller image
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
