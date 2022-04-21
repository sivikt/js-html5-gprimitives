LineDrawLogger = newClass(PointDrawLogger, {
	withErrors : false,
  
  	constructor: function() {
		this.constructor.prototype.constructor.call(this, arguments[0]); 
	},
						  
	convertData : function() {
		var table;
		if (this.withErrors) {
			table = '<table><tr><th>step</th><th>x</th><th>y</th><th>error</th><th>Plot(x,y)</th></tr>';
			for (var i = 0; i < this.data.length; i++) {
				table += '<tr><td>' + this.data[i].step + '</td><td>' + this.data[i].x.toFixed(2) + '</td><td>' + 
						this.data[i].y.toFixed(2) + '</td><td>' + 
						this.data[i].err.toFixed(2) + '</td><td>Plot(' + this.data[i].xp + ' ,' + this.data[i].yp + ')</td></tr>';
			}
		} else {
			table = '<table><tr><th>step</th><th>x</th><th>y</th><th>Plot(x,y)</th></tr>';
			for (var i = 0; i < this.data.length; i++) {
				table += '<tr><td>' + this.data[i].step + '</td><td>' + this.data[i].x.toFixed(2) + '</td><td>' + 
						this.data[i].y.toFixed(2) + '</td><td>Plot(' + this.data[i].xp + ' ,' + this.data[i].yp + ')</td></tr>';
			}
		}
		
		table += '</table>';
		
		return table;
	}
});

/**
  This class used to draw line by different ways
 */
LineDrawer = newClass(PointDrawer, {						
	stepByStepFunc: null,
					  
	DDA : 'dda',
					  
	BREZ : 'brez',
					  
	WU : 'wu',				  
  
	constructor: function() {
		var me = this;
		
		me.constructor.prototype.constructor.call(me, arguments[0]);

		me.firstPoint = null; 
		me.currentAlgorithm = me.DDA;
		apply(me, arguments[0]);
		
		// dda draw line algorithm
		var ddaAlgorithm = function(points) {
			if (!points)
				return;
			
			me.__context.fillStyle = me.algorithms[me.DDA].color;
			me.__context.globalAlpha = me.__alpha;
			
			var p_1 = points[0];  
			var p_2 = points[1];
			
			// format coordinates in order to scale
			p_1.x = Math.floor(p_1.x / me.__scale);
			p_2.x = Math.floor(p_2.x / me.__scale);
			p_1.y = Math.floor(p_1.y / me.__scale);
			p_2.y = Math.floor(p_2.y / me.__scale);
			
			var step = 0;
			if (me.logger) {
				me.logger.withErrors = false;
			}
			
			if (p_1.x == p_2.x && p_1.y == p_2.y) {
				me.constructor.prototype.draw.call(me, {
					x: p_1.x * me.__scale, 
					y: p_1.y * me.__scale
				}, true);
					
				if (me.logger) {
					me.logger.addData({step: ++step,
									x: p_1.x, 
									y: p_1.y, 
									xp: p_1.x, 
									yp: p_1.y});
				}	
					
				yield null;	
			}
			
			// расстояние по x и y между координатами
			var len_x = Math.abs(p_2.x - p_1.x);
			var len_y = Math.abs(p_2.y - p_1.y);
			
			// максимальное расстояние
			var length = Math.max(len_x, len_y);
			
			// приращение по х и у
			var dx = (p_2.x - p_1.x) / length;
			var dy = (p_2.y - p_1.y) / length;
			
			// текущие координаты
			var point = {};
			point.x = p_1.x;
			point.y = p_1.y;
			
			// рисуем первую точку
			me.constructor.prototype.draw.call(me, {
				x: point.x * me.__scale, 
				y: point.y * me.__scale
			}, true);
			
			// логируем
			if (me.logger) {
				me.logger.addData({step: ++step,
									x: point.x, 
									y: point.y, 
									xp: point.x, 
									yp: point.y});
			}
			
			var i = 0;
			// основной цикл
			while (i++ < length) {
				// изменяем текущие координаты
				point.x += dx;
				point.y += dy;
				
				if (me.stepByStepModeOn) {
					yield point;
				}
				
				me.constructor.prototype.draw.call(me, {
					x: Math.round(point.x) * me.__scale, 
					y: Math.round(point.y) * me.__scale
				}, true);
				
				if (me.logger) {
					me.logger.addData({step: ++step,
									x: point.x, 
									y: point.y, 
									xp: Math.round(point.x), 
									yp: Math.round(point.y)});
				}	
			}
			
			yield null;
		};
		
		// Bresenham's draw line algorithm
		var bresAlgorithm = function(points) {
			if (!points)
			  return;
			
			me.__context.fillStyle = me.algorithms[me.BREZ].color;
			me.__context.globalAlpha = me.__alpha;
			
			var p_1 = points[0];  
			var p_2 = points[1];
			
			var dx, dy;
			var incX, incY;
			var pdx, pdy;
			var ddx, ddy;
			var e, es, el;
			var point = {};
			
			p_1.x = Math.floor(p_1.x / me.__scale);
			p_2.x = Math.floor(p_2.x / me.__scale);
			p_1.y = Math.floor(p_1.y / me.__scale);
			p_2.y = Math.floor(p_2.y / me.__scale);
			
			var step = 0;
			if (me.logger) {
				me.logger.withErrors = true;
			}
			
			// если начало и конец совпадают - рисуем точку и выходим
			if (p_1.x == p_2.x && p_1.y == p_2.y) {
				me.constructor.prototype.draw.call(me, {
					x: p_1.x * me.__scale, 
					y: p_1.y * me.__scale
				}, true);

				// логируем
				if (me.logger) {
					me.logger.addData({step: ++step, 
									x: p_1.x, 
									y: p_1.y, 
									xp: p_1.x, 
									yp: p_1.y,
									e: 0});
				}
									
				yield null;	
			}
			
			// приращение по х и по у
			dx = p_2.x - p_1.x;
			dy = p_2.y - p_1.y;
			
			// no increment, if dx (or dy) == 0
			incX = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
			incY = dy > 0 ? 1 : (dy < 0 ? -1 : 0);
			
			if (dx < 0) dx = -dx;
			if (dy < 0) dy = -dy;
			
			// find the steep. (dx > dy) means the angle is acute
			// x is growing faster
			if (dx > dy) {
				pdx = incX;	pdy = 0;	//parallel shifts
				ddx = incX;	ddy = incY;	//diagonal shifts
				es = dy; el = dx;		//es - error_fast, el - error_slow
			} else { //if angle is obtuse
				pdx = 0;	pdy = incY;
				ddx = incX;	ddy = incY;
				es = dx; el = dy;
			} 
			
			// текущие координаты
			point.x = p_1.x;
			point.y = p_1.y;
			
			// начальное значение ошибки
			e = el/2;
			
			// рисуем первую точку
			me.constructor.prototype.draw.call(me, {
				x: point.x * me.__scale, 
				y: point.y * me.__scale
			}, true);
			
			// логируем
			if (me.logger) {
				me.logger.addData({step: ++step,
									x: point.x, 
									y: point.y, 
									xp: point.x, 
									yp: point.y,
									err: e});
			}
					
			// основной цикл	
			for (var i = 0; i < el; i++) {
				// if angle is acute, then el is dx,
				// else: t is going as y
				// изменяем значение ошибки
				e -= es;
				
				// в зависимости от знака ошибки приращиваем текущие координаты
				if (e < 0) { // if error is still > 0
					e += el;
					point.x += ddx;
					point.y += ddy;
				} else {
					point.x += pdx;
					point.y += pdy;
				}
				
				if (me.stepByStepModeOn) {
					yield point;
				}
				
				// отричовываем текущую точку
				me.constructor.prototype.draw.call(me, {
					x: Math.round(point.x) * me.__scale, 
					y: Math.round(point.y) * me.__scale
				}, true);

				// логируем
				if (me.logger) {
					me.logger.addData({step: ++step,
									x: point.x, 
									y: point.y, 
									xp: Math.round(point.x), 
									yp: Math.round(point.y),
									err: e});
				}					
			}
			
			yield null;
		};
		
		// draw line with antialiasing (Wu algorithm)
		var wuAlgorithm = function(points) {
			if (!points)
			  return;
			
			me.__context.fillStyle = me.algorithms[me.WU].color;
			
			var p_1 = points[0];
			var p_2 = points[1];
			
			var dx, dy; // приращение по х и у
			var xend, yend; // координаты концевых точек
			var xgap, ygap;
			var xpxl1, ypxl1, xpxl2, ypxl2; // используются в основном цикле в зависимотсти от угла наклона прямой
			var intery; // текущий у (для цикла)
			var gradient; // яркость пикселя
			
			p_1.x = Math.floor(p_1.x / me.__scale);
			p_2.x = Math.floor(p_2.x / me.__scale);
			p_1.y = Math.floor(p_1.y / me.__scale);
			p_2.y = Math.floor(p_2.y / me.__scale);
			
			var step = 0;
			if (me.logger) {
				me.logger.withErrors = true;
			}
			
			// если координаты совпадают - отрисовываем точку и выходим
			if (p_1.x == p_2.x && p_1.y == p_2.y) {
				me.constructor.prototype.draw.call(me, {
					x: p_1.x * me.__scale, 
					y: p_1.y * me.__scale
				}, true);
					
				// логируем
				if (me.logger) {
				  me.logger.addData({step: ++step,
									x: p_1.x, 
									y: p_1.y, 
									xp: p_1.x, 
									yp: p_1.y,
									err: 0});
				}
				
				yield null;	
			}
			
			// считаем приращение
			dx = p_2.x - p_1.x;
			dy = p_2.y - p_1.y;
			
			// если тангенс = [-1 : 1]
			// для тупого угла всё аналогично
			if (Math.abs(dx) >= Math.abs(dy)) {
				if (p_2.x < p_1.x) {
					// swap x1 and x2
					p_2.x = p_1.x + p_2.x;
					p_1.x = p_2.x - p_1.x;
					p_2.x = p_2.x - p_1.x;
					
					// swap y1 and y2
					p_2.y = p_1.y + p_2.y;
					p_1.y = p_2.y - p_1.y;
					p_2.y = p_2.y - p_1.y;
				}
				
				dx = p_2.x - p_1.x;
				dy = p_2.y - p_1.y;
				
				gradient = dy / dx;
				
				// обработать первую точку
				xend = Math.round(p_1.x);
				yend = p_1.y + gradient * (xend - p_1.x);
				// fpart - дробная часть
				xgap = 1 - fpart(p_1.x + 0.5);
				
				xpxl1 = xend;  			// будет использоваться в основном цикле
				// ipart - целая часть
				ypxl1 = ipart(yend);
				
				// считаем яркость и отрисовываем первые две точки (начало)
				me.__context.globalAlpha = 1 - fpart(yend) * xgap;
				me.constructor.prototype.draw.call(me, {
					x: xpxl1 * me.__scale, 
					y: ypxl1 * me.__scale
				}, true);
				
				me.__context.globalAlpha = fpart(yend) * xgap;
				me.constructor.prototype.draw.call(me, {
					x: xpxl1 * me.__scale, 
					y: (ypxl1 + 1) * me.__scale
				}, true);		
				
				// логируем
				if (me.logger) {
					me.logger.addData({step: ++step,
								x: xpxl1, 
								y: ypxl1, 
								xp: xpxl1, 
								yp: ypxl1,
								err: 1 - fpart(yend) * xgap});
								
					me.logger.addData({step: step,
								x: xpxl1, 
								y: (ypxl1 + 1), 
								xp: xpxl1, 
								yp: (ypxl1 + 1),
								err: fpart(yend) * xgap});								   
				}
				
				intery = yend + gradient;
				
				// обработать вторую точку
				xend = Math.round(p_2.x);
				yend = p_2.y + gradient * (xend - p_2.x);
				xgap = fpart(p_2.x + 0.5);
				xpxl2 = xend;				// будет использоваться в основном цикле
				ypxl2 = ipart(yend);
				
				// считаем яркость и отрисовываем вторые две точки (конец)
				me.__context.globalAlpha = 1 - fpart(yend) * xgap;
				me.constructor.prototype.draw.call(me, {
					x: xpxl2 * me.__scale, 
					y: ypxl2 * me.__scale
				}, true);
				
				me.__context.globalAlpha = fpart(yend) * xgap;
				me.constructor.prototype.draw.call(me, {
					x: xpxl2 * me.__scale, 
					y: (ypxl2 + 1) * me.__scale
				}, true);
				
				// логируем
				if (me.logger) {
					me.logger.addData({step: ++step,
								x: xpxl2, 
								y: ypxl2, 
								xp: xpxl2, 
								yp: ypxl2,
								err: 1 - fpart(yend) * xgap});
								
					me.logger.addData({step: step,
								x: xpxl2, 
								y: (ypxl2 + 1), 
								xp: xpxl2, 
								yp: (ypxl2 + 1),
								err: fpart(yend) * xgap});								   
				}
				
				// основной цикл
				// идем по х - угол острый
				for (var x = xpxl1 + 1; x < xpxl2; x++) {
					if (me.stepByStepModeOn) {
						yield {
							x : x,
							y : ipart(intery)
						}
					}
					
					me.__context.globalAlpha = 1 - fpart(intery);
					me.constructor.prototype.draw.call(me, {
						x: x * me.__scale, 
						y: ipart(intery) * me.__scale
					}, true);
					
					me.__context.globalAlpha = fpart(intery);
					me.constructor.prototype.draw.call(me, {
						x: x * me.__scale, 
						y: (ipart(intery) + 1) * me.__scale
					}, true);
					
					if (me.logger) {
						me.logger.addData({step: ++step,
									x: x, 
									y: ipart(intery), 
									xp: x, 
									yp: ipart(intery),
									err: 1 - fpart(intery)});
									
						me.logger.addData({step: step,
									x: x, 
									y: (ipart(intery) + 1), 
									xp: x, 
									yp: (ipart(intery) + 1),
									err: fpart(intery)});								   
					}
					
					// увеличиваем у
					intery = intery + gradient;
				}
			} else {
				if (p_2.y < p_1.y) {
					// swap x1 and x2
					p_2.x = p_1.x + p_2.x;
					p_1.x = p_2.x - p_1.x;
					p_2.x = p_2.x - p_1.x;
					
					// swap y1 and y2
					p_2.y = p_1.y + p_2.y;
					p_1.y = p_2.y - p_1.y;
					p_2.y = p_2.y - p_1.y;
				}
				
				dx = p_2.x - p_1.x;
				dy = p_2.y - p_1.y;
				
				gradient = dx / dy;
				
				yend = Math.round(p_1.y);
				xend = p_1.x + gradient * (yend - p_1.y);
				ygap = 1 - fpart(p_1.y + 0.5);
				
				xpxl1 = ipart(xend);  			// будет использоваться в основном цикле
				ypxl1 = yend;
				
				me.__context.globalAlpha = 1 - fpart(xend) * ygap;
				me.constructor.prototype.draw.call(me, {
					x: xpxl1 * me.__scale, 
					y: ypxl1 * me.__scale
				}, true);
				
				me.__context.globalAlpha = fpart(xend) * ygap;
				me.constructor.prototype.draw.call(me, {
					x: (xpxl1 + 1) * me.__scale, 
					y: ypxl1 * me.__scale
				}, true);		
				
				if (me.logger) {
					me.logger.addData({step: ++step,
								x: xpxl1, 
								y: ypxl1, 
								xp: xpxl1, 
								yp: ypxl1,
								err: 1 - fpart(xend) * ygap});
								
					me.logger.addData({step: step,
								x: xpxl1 + 1, 
								y: ypxl1, 
								xp: xpxl1 + 1, 
								yp: ypxl1,
								err: fpart(xend) * ygap});								   
				}				
				
				intery = xend + gradient;
				
				// обработать вторую точку
				yend = Math.round(p_2.y);
				xend = p_2.x + gradient * (yend - p_2.y);
				ygap = fpart(p_2.y + 0.5);
				xpxl2 =	ipart(xend);				// будет использоваться в основном цикле
				ypxl2 = yend;
				
				me.__context.globalAlpha = 1 - fpart(xend) * ygap;
				me.constructor.prototype.draw.call(me, {
					x: xpxl2 * me.__scale, 
					y: ypxl2 * me.__scale
				}, true);
				
				me.__context.globalAlpha = fpart(xend) * ygap;
				me.constructor.prototype.draw.call(me, {
					x: (xpxl2 + 1) * me.__scale, 
					y: ypxl2 * me.__scale
				}, true);
				
				if (me.logger) {
					me.logger.addData({step: ++step,
								x: xpxl2, 
								y: ypxl2, 
								xp: xpxl2, 
								yp: ypxl2,
								err: 1 - fpart(xend) * ygap});
								
					me.logger.addData({step: step,
								x: xpxl2 + 1, 
								y: ypxl2, 
								xp: xpxl2 + 1, 
								yp: ypxl2,
								err: fpart(xend) * ygap});								   
				}				
				
				// основной цикл
				for (var y = ypxl1 + 1; y < ypxl2; y++) {
					if (me.stepByStepModeOn) {
						yield {
							x : ipart(intery),
							y : y
						}
					}
					
					me.__context.globalAlpha = 1 - fpart(intery);
					me.constructor.prototype.draw.call(me, {
						x: ipart(intery) * me.__scale, 
						y: y * me.__scale
					}, true);
					
					me.__context.globalAlpha = fpart(intery);
					me.constructor.prototype.draw.call(me, {
						x: (ipart(intery) + 1) * me.__scale, 
						y: y * me.__scale
					}, true);
					
					if (me.logger) {
						me.logger.addData({step: ++step,
									x: ipart(intery), 
									y: y, 
									xp: ipart(intery), 
									yp: y,
									err: 1 - fpart(intery)});
									
						me.logger.addData({step: step,
									x: (ipart(intery) + 1), 
									y: y, 
									xp: (ipart(intery) + 1), 
									yp: y,
									err: fpart(intery)});								   
					}
					
					intery = intery + gradient;
				}
			}
			
			me.__context.globalAlpha = me.__alpha;
			
			yield null;
		};				    
		
		me.algorithms = [];
		me.algorithms[me.DDA] = {
			func : ddaAlgorithm,
			color : '#b07856'
		};
		me.algorithms[me.BREZ] = { 
			func : bresAlgorithm,
			color : '#b05678'
		};
		me.algorithms[me.WU] = {
			func : wuAlgorithm,
			color : '#9156b0'
		};
		
		me.isExecuting = false;
	},
				    
	draw : function(points) {
		if (this.algorithms[this.currentAlgorithm]) {
			this.algorithms[this.currentAlgorithm].func(points).next(); 
		}
	},
  	  
	addPoint : function(point) {
		var me = this;
		
		if (!point || this.isExecuting)
			return;
		  
		var oldStyle = me.__context.fillStyle;
		me.__context.fillStyle = me.__webColor; 
		  
		if (me.firstPoint) {
			if (me.logger)
				me.logger.clearData();
			
			if (!me.stepByStepModeOn) {
				me.draw([me.firstPoint, point]);
			} else {
				me.isExecuting = true;
				me.makeStep([me.firstPoint, point]);
			}	
			me.firstPoint = null;
		} else {
			me.firstPoint = point;	  
		}
	},
				    
	setScale : function(ds) {
		this.constructor.prototype.setScale.call(this, ds);
	},	

	setAlgorithm : function(algName) {
		this.currentAlgorithm = algName;
	},
				
	makeStep: function(points) {
		var me = this;
		if (me.stepByStepModeOn && me.algorithms[me.currentAlgorithm] && me.isExecuting) {
			if (!me.stepByStepFunc) {
				// execute the first step of algorithm 
				me.stepByStepFunc = me.algorithms[me.currentAlgorithm].func(points);
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
	}
});