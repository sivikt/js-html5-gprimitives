EllipseDrawLogger = newClass(LineDrawLogger, { 
  	constructor: function() {
		this.constructor.prototype.constructor.call(this, arguments[0]); 
	},
							 
	convertData : function() {
		var table = '<table><tr><th>step</th><th>x</th><th>y</th><th>error</th><th>pixel</th></tr>';

		for (var i = 0; i < this.data.length; i++) {
			table += '<tr><td>' + this.data[i].step + '</td><td>' + this.data[i].x.toFixed(2) + '</td><td>' + 
					this.data[i].y.toFixed(2) + '</td><td>' + 
					this.data[i].err.toFixed(2) + '</td><td>' + this.data[i].pixel + '</td></tr>';
		}
		
		table += '</table>';
		
		return table;
	}
});

/**
  This class used to draw ellipses
 */
EllipseDrawer = newClass(PointDrawer, {						  
	globalParamA: 1,
						 
	globalParamB: 2,
  
	constructor : function() {
		var me = this;
		
		me.constructor.prototype.constructor.call(this, arguments[0]);
		
		me.firstPoint = null; 
		apply(me, arguments[0]);
	},
				    
	draw : function* (centerPoint, param_a, param_b) {
		var me = this;
		
		if (!centerPoint)
			yield null;
		
		var oldStyle = me.__context.fillStyle;
		me.__context.fillStyle = me.__webColor;
		
		if (!param_a)
		  param_a = me.globalParamA;
		
		if (!param_b)
		  param_b = me.globalParamB;
		
		// format coordinates in order to scale
		centerPoint.x = Math.floor(centerPoint.x / me.__scale);
		centerPoint.y = Math.floor(centerPoint.y / me.__scale);
		
		var sqr_a = param_a * param_a;
		var sqr_b = param_b * param_b;
		
		var x = 0;		// начальные координаты
		var y = param_b;
		
		var limit = 0;
		var err = sqr_a + sqr_b - 2*sqr_a*param_b; // ошибка
		
		// рисуем первую точку
		me.constructor.prototype.draw.call(this, {
			x: (x + centerPoint.x) * me.__scale, 
			y: (y + centerPoint.y) * me.__scale
		}, true);
		
		// отражаем её
		me.constructor.prototype.draw.call(this, {
			x: (x + centerPoint.x) * me.__scale, 
			y: (centerPoint.y - y) * me.__scale
		}, true);
		
		var step = 0;
		// сначала пиксель горизонтальный
		var pixel = 'H';
		// логируем
		if (me.logger) {
			me.logger.addData({step: ++step,
							x: x + centerPoint.x, 
							y: y + centerPoint.y, 
							xp: x + centerPoint.x, 
							yp: y + centerPoint.y,
							err: err,
							pixel: pixel});			
		}		
		
		// основной цикл
		while (y > limit) {
			if (err < 0) {
				if ( (2*(err + sqr_a*y) - 1) <= 0 ) {
					// выбирем горизонтальный пиксель
					x++;
					err = err + sqr_b*(2*x + 1);
					pixel = 'H';
				} else {
					// выбираем диагональный пиксель
					x++;
					y--;
					err = err + sqr_b*(2*x + 1) + sqr_a*(1 - 2*y);
					pixel = 'D';
				}
			} else if (err > 0) {
				if ( (2*(err - sqr_b*x) - 1) > 0 ) {
					// выбираем вертикальный пиксель
					y--;
					err = err + sqr_a*(1 - 2*y);
					pixel = 'V';
				} else {
					// выбираем диагональный пиксель
					x++;
					y--;
					err = err + sqr_b*(2*x + 1) + sqr_a*(1 - 2*y);
					pixel = 'D';
				}
			} else {
				// выбираем диагональный пиксель
				x++;
				y--;
				err = err + sqr_b*(2*x + 1) + sqr_a*(1 - 2*y);
				pixel = 'D';
			}
			
			if (me.stepByStepModeOn) {
				yield {x: x, y: y};
			}
			
			// рисуем и отражаем полученные координаты
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
						 
	setGlobalParamA: function(a) {
		a = Math.abs(a);
		if (a)
			this.globalParamA = a;
		else
			this.globalParamA = 1;
	},
						 
	setGlobalParamB: function(b) {
		b = Math.abs(b);
		if (b)
			this.globalParamB = b;
		else
			this.globalParamB = 1;
	}
});