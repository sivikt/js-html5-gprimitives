CircleDrawLogger = newClass(EllipseDrawLogger, { 
  	constructor: function() {
		this.constructor.prototype.constructor.call(this, arguments[0]); 
	}
});

/**
  This class used to draw circles
 */
CircleDrawer = newClass(PointDrawer, {
	globalRadius : 2,							  
								  
	constructor : function() {
		var me = this;
		
		me.constructor.prototype.constructor.call(this, arguments[0]);
		
		me.firstPoint = null; 
		apply(me, arguments[0]);
	},
	
	// algorithm builds 1/4 of the circle so it's so hard. 
	// алгоритм полностью аналогичен алгоритму построения эллипса,
	// так как является его частным случаем
	draw : function(centerPoint, radius) {
		var me = this;
		
		if (!centerPoint)
			yield null;
		
		var oldStyle = me.__context.fillStyle;
		me.__context.fillStyle = me.__webColor;
		
		if (!radius)
		  radius = me.globalRadius;
		
		// format coordinates in order to scale
		centerPoint.x = Math.floor(centerPoint.x / me.__scale);
		centerPoint.y = Math.floor(centerPoint.y / me.__scale);		
		
		var x = 0;
		var y = radius;
		
		var limit = 0;
		var err = 2 - 2*radius;
		
		me.constructor.prototype.draw.call(this, {
			x: (x + centerPoint.x) * me.__scale, 
			y: (y + centerPoint.y) * me.__scale
		}, true);
		
		me.constructor.prototype.draw.call(this, {
			x: (x + centerPoint.x) * me.__scale, 
			y: (centerPoint.y - y) * me.__scale
		}, true);
		
		var step = 0;
		var pixel = 'H';
		if (me.logger) {
			me.logger.addData({step: ++step,
							x: x + centerPoint.x, 
							y: y + centerPoint.y, 
							xp: x + centerPoint.x, 
							yp: y + centerPoint.y,
							err: err,
							pixel: pixel});			
		}
		
		while (y > limit) {
			if (err < 0) {
				if ( (2*err + 2*y - 1) <= 0 ) {
					x++;
					err = err + 2*x + 1;
					pixel = 'H';
				} else {
					x++;
					y--;
					err = err + 2*x - 2*y + 2;
					pixel = 'D';
				}
			} else if (err > 0) {
				if ( (2*err - 2*x - 1) > 0 ) {
					y--;
					err += -2*y + 1;
					pixel = 'V';
				} else {
					x++;
					y--;
					err += 2*x - 2*y + 2;
					pixel = 'D';
				}
			} else {
				x++;
				y--;
				err += 2*x - 2*y + 2;
				pixel = 'D';
			}
			
			if (me.stepByStepModeOn) {
				yield {x: x, y: y};
			}
			
			me.constructor.prototype.draw.call(this, {
				x: (x + centerPoint.x) * me.__scale, 
				y: (y + centerPoint.y) * me.__scale
			}, true);
			
			me.constructor.prototype.draw.call(this, {
				x: (centerPoint.x - x) * me.__scale, 
				y: (y + centerPoint.y) * me.__scale
			}, true);
			
			me.constructor.prototype.draw.call(this, {
				x: (x + centerPoint.x) * me.__scale, 
				y: (centerPoint.y - y) * me.__scale
			}, true);
			
			me.constructor.prototype.draw.call(this, {
				x: (centerPoint.x - x) * me.__scale, 
				y: (centerPoint.y - y) * me.__scale
			}, true);
			
			if (me.logger) {
				me.logger.addData({step: ++step,
								x: x + centerPoint.x, 
								y: y + centerPoint.y, 
								xp: x + centerPoint.x, 
								yp: y + centerPoint.y,
								err: err,
								pixel: pixel});								
			}
		}
		
		me.__context.fillStyle = oldStyle;
		
		yield null;
	},
  	  
	addPoint : function(centerPoint) {	  
	  var me = this;
		
		if (!centerPoint || this.isExecuting)
			return;
		  
		var oldStyle = me.__context.fillStyle;
		me.__context.fillStyle = me.__webColor; 
		  
		if (me.logger)
			me.logger.clearData();
		
		if (!me.stepByStepModeOn) {
			me.draw(centerPoint).next();
		} else {
			me.isExecuting = true;
			me.makeStep(centerPoint);
		}	
	},
	
	makeStep: function(centerPoint) {
		var me = this;
		if (me.stepByStepModeOn && me.isExecuting) {
			if (!me.stepByStepFunc) {
				// execute the first step of algorithm 
				me.stepByStepFunc = me.draw(centerPoint);
				me.stepByStepFunc.next();
			} else {
				// do next step of algorithm
				var val = me.stepByStepFunc.next();
				
				if (!val) {// stopped executing
					alert('that\'s all!');
					me.stepByStepFunc = null;
					me.isExecuting = false;
				}
				
				return val;
			}
		}
	},
								  
	setGlobalRadius : function(radius) {
		if (radius && radius >= 0)
			this.globalRadius = radius;
		else
			this.globalRadius = 0;
	}							  
});