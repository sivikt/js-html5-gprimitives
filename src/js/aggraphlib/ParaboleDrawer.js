ParaboleDrawLogger = newClass(EllipseDrawLogger, { 
  	constructor: function() {
		this.constructor.prototype.constructor.call(this, arguments[0]); 
	},
							 
	convertData : function() {
		var table = '<table><tr><th>step</th><th>x</th><th>y</th><th>Sd</th><th>Sv</th><th>Sh</th></tr>';

		for (var i = 0; i < this.data.length; i++) {
			table += '<tr><td>' + this.data[i].step + '</td><td>' + this.data[i].x.toFixed(2) + '</td><td>' + 
					this.data[i].y.toFixed(2) + '</td><td>' + 
					this.data[i].Sd.toFixed(2) + '</td><td>' + 
					this.data[i].Sv.toFixed(2) + '</td><td>' + 
					this.data[i].Sh.toFixed(2) + '</td></tr>';
		}
		
		table += '</table>';
		
		return table;
	}
});

/**
  This class used to draw paraboles
 */
ParaboleDrawer = newClass(PointDrawer, {
		
	SQR_Y : 'sqr_y',

	SQR_X : 'sqr_x',						  
						  
	globalParam : 1,
						  
	__webColor : '#e7d26e',
  
	constructor : function() {
		var me = this;
		
		me.currentKind = me.SQR_Y;
		me.constructor.prototype.constructor.call(this, arguments[0]);
		
		var sqr_y = function* (vertexPoint, param_p) {
			if (!vertexPoint)
				yield null;
		  
			var oldStyle = me.__context.fillStyle;
			me.__context.fillStyle = me.kinds[me.currentKind].color;
			
			if (!param_p)
				param_p = me.globalParam;
			
			var doubleP = 2 * param_p;
			
			// format true vertex coordinates in order to scale
			vertexPoint.x = Math.floor(vertexPoint.x / me.__scale);
			vertexPoint.y = Math.floor(vertexPoint.y / me.__scale);
						
			var x = 0; //  центр
			var y = 0;
			
			// разница расстояний для диагонального, вертикального и горизонтального пикселей 
			var Sd = ((y + 1) * (y + 1) )- doubleP * (x + 1);
			var Sv = ((y + 1)*(y + 1)) - doubleP * x;
			var Sh = (y*y) - 2 * doubleP * (x + 1);
			
			// рисуем первую точку в вершине
			me.constructor.prototype.draw.call(me, {
				x: (x + vertexPoint.x) * me.__scale, 
				y: (y + vertexPoint.y) * me.__scale
			}, true);  
			
			var step = 0;
			// логируем
			if (me.logger) {
				me.logger.addData({step: ++step,
							x: x + vertexPoint.x, 
							y: y + vertexPoint.y, 
							xp: x + vertexPoint.x, 
							yp: y + vertexPoint.y,
							Sd: 0,
							Sv: 0,
							Sh: 0});			
			}			
			
			// максималное число пикселей по х
			var maxX = me.__canvas.clientWidth / me.__scale;
			while (x + vertexPoint.x < maxX) { //пока полотно не кончится
				if (Math.abs(Sh) - Math.abs(Sv) <= 0) {
					if (Math.abs(Sd) - Math.abs(Sh) < 0)
						y++; // выбираем диагональный пиксель
					
					x++; // выбираем горизонтальный пиксель
				} else {
					if (Math.abs(Sv) - Math.abs(Sd) > 0)
						x++; // выбираем диагональный пиксель
					
					y++; // выбираем вертикальный пиксель
				}

				if (me.stepByStepModeOn) {
					yield {x: x, y: y};
				}

				me.constructor.prototype.draw.call(me, {
					x: (x + vertexPoint.x) * me.__scale, 
					y: (y + vertexPoint.y) * me.__scale
				}, true);
				
				me.constructor.prototype.draw.call(me, {
					x: (vertexPoint.x + x) * me.__scale, 
					y: (vertexPoint.y - y) * me.__scale
				}, true);

				if (me.logger) {
					me.logger.addData({step: ++step,
								x: x + vertexPoint.x, 
								y: y + vertexPoint.y, 
								xp: x + vertexPoint.x, 
								yp: y + vertexPoint.y,
								Sd: Sd,
								Sv: Sv,
								Sh: Sh});			
				}					
				
				// изменяем разницу
				Sd = ((y + 1) * (y + 1)) - doubleP * (x + 1);
				Sv = ((y + 1) * (y + 1)) - doubleP * x;
				Sh = (y * y) - doubleP * (x + 1);
			}
					
			me.__context.fillStyle = oldStyle;		
					
			yield null;
		};
		
		// этот алгоритм полностью аналогичен предыдущему
		var sqr_x = function* (vertexPoint, param_p) {
			if (!vertexPoint)
				yield null;
		  
			var oldStyle = me.__context.fillStyle;
			me.__context.fillStyle = me.kinds[me.currentKind].color;
			
			if (!param_p)
				param_p = me.globalParam;
			
			var doubleP = 2 * param_p;
			
			// format coordinates in order to scale
			vertexPoint.x = Math.floor(vertexPoint.x / me.__scale);
			vertexPoint.y = Math.floor(vertexPoint.y / me.__scale);
						
			var x = 0; //  центр
			var y = 0;
			
			var Sd = ((x + 1) * (x + 1) )- doubleP * (y + 1);
			var Sv = ((x + 1)*(x + 1)) - doubleP * y;
			var Sh = (x*x) - 2 * doubleP * (y + 1);
			
			me.constructor.prototype.draw.call(me, {
				x: (x + vertexPoint.x) * me.__scale, 
				y: (y + vertexPoint.y) * me.__scale
			}, true);  

			// логируем
			var step = 0;
			if (me.logger) {
				me.logger.addData({step: ++step,
							x: x + vertexPoint.x, 
							y: y + vertexPoint.y, 
							xp: x + vertexPoint.x, 
							yp: y + vertexPoint.y,
							Sd: 0,
							Sv: 0,
							Sh: 0});			
			}			
			
			var maxY = me.__canvas.clientHeight / me.__scale;
			while (y + vertexPoint.y < maxY) { //пока полотно не кончится
				if (Math.abs(Sh) - Math.abs(Sv) <= 0) {
					if (Math.abs(Sd) - Math.abs(Sh) < 0)
						x++;
					
					y++;
				} else {
					if (Math.abs(Sv) - Math.abs(Sd) > 0)
						y++;
					
					x++;
				}

				if (me.stepByStepModeOn) {
					yield {x: x, y: y};
				}

				me.constructor.prototype.draw.call(me, {
					x: (x + vertexPoint.x) * me.__scale, 
					y: (y + vertexPoint.y) * me.__scale
				}, true);
				
				me.constructor.prototype.draw.call(me, {
					x: (vertexPoint.x - x) * me.__scale, 
					y: (vertexPoint.y + y) * me.__scale
				}, true);

				if (me.logger) {
					me.logger.addData({step: ++step,
								x: x + vertexPoint.x, 
								y: y + vertexPoint.y, 
								xp: x + vertexPoint.x, 
								yp: y + vertexPoint.y,
								Sd: Sd,
								Sv: Sv,
								Sh: Sh});			
				}				
				
				Sd = ((x + 1) * (x + 1)) - doubleP * (y + 1);
				Sv = ((x + 1) * (x + 1)) - doubleP * y;
				Sh = (x * x) - doubleP * (y + 1);
			}
					
			me.__context.fillStyle = oldStyle;		
					
			yield null;
		};
		
		me.kinds = []; 
		me.kinds[me.SQR_Y] = {
			func : sqr_y,
			color : '#8979d9'
		};
		me.kinds[me.SQR_X] = {
			func : sqr_x,
			color : '#c679d9'
		};
		
		me.firstPoint = null; 
		apply(me, arguments[0]);
	},
				    
	draw : function(vertexPoint, param_p) {
		if (this.kinds[this.currentKind])
			this.kinds[this.currentKind].func(vertexPoint, param_p).next();
	},
  	  
	addPoint : function(vertexPoint) {	  
	  var me = this;
		
		if (!vertexPoint || this.isExecuting)
			return;
		
		if (me.logger)
			me.logger.clearData();
		
		if (!me.stepByStepModeOn) {
			me.draw(vertexPoint);
		} else {
			me.isExecuting = true;
			me.makeStep(vertexPoint);
		}	
	},
	
	makeStep: function(vertexPoint) {
		var me = this;
		if (me.stepByStepModeOn && me.isExecuting) {
			if (!me.stepByStepFunc) {
				// execute the first step of algorithm 
				me.stepByStepFunc = me.kinds[me.currentKind].func(vertexPoint);
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
						  
	setCurrentKind: function(kindId) {
		this.currentKind = kindId;
	},
						  
	setGlobalParam: function(p) {
		p = Math.abs(p);
		if (p)
			this.globalParam = p;
		else
			this.globalParam = 1;
	}
});