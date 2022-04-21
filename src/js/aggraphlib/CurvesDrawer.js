CurvesDrawLogger = newClass(LineDrawLogger, { 
  	constructor: function() {
		this.constructor.prototype.constructor.call(this, arguments[0]); 
	}
});

/**
  This class used to draw curves
 */
CurvesDrawer = newClass(PointDrawer, {
					  
	ERMIT : 'ermit',
					  
	BEZIE : 'bezie',			
  
	BSPLINE : 'bspline',
						
	__webColor : '#e7d26e',
  
	constructor : function* () {
		var me = this;
		
		me.constructor.prototype.constructor.call(this, arguments[0]);
			
		apply(me, arguments[0]);

		me.currentMethod = me.ERMIT;
		me.points = [];

		me.params = {
			r1x : 8,
			r1y : 0,
			r2x : 0,
			r2y : 10,
			iterCount : 100,
			dotsCount : 2
		};
		
		// construction method of the Hermite
		var ermit = function* (points) {	
			if (!points)
				yield null;
			else 
				for ( var i = 0; i < me.params.dotsCount; i++) {
					points[i].x = Math.floor(points[i].x / me.__scale);
					points[i].y = Math.floor(points[i].y / me.__scale);
				}
				  
			var oldStyle = me.__context.fillStyle;
			me.__context.fillStyle = me.methods[me.ERMIT].color;

			// матрица коэффиуиентов производных (Эрмитова матрица)
			var m = $M([
				[2, -2, 1, 1],
				[-3, 3, -2, -1], 
				[0, 0, 1, 0], 
				[1, 0, 0, 0]
			]);
			
			// матрица граничных точек
			var c = $M([
				[points[0].x, points[0].y], 
				[points[1].x, points[1].y], 
				[me.params.r1x, me.params.r1y], 
				[me.params.r2x, me.params.r2y]
			]);

			m = m.x(c);
			
			var v = Matrix.Zero(1, 4);
			// приращение параметра t
			var step = 1.0 / me.params.iterCount;
			
			var logStep = 0;
			
			// изменяем параметр и вычисляем координаты
			for( var t = 0; t <= 1; t += step ) {
				v.setElements([[t * t * t, t * t, t, 1]]);

				var p = v.x(m);

				me.constructor.prototype.draw.call(me, {
					x: Math.floor(p.elements[0][0]) * me.__scale, 
					y: Math.floor(p.elements[0][1]) * me.__scale
				}, true);
				
				if (me.stepByStepModeOn) {
					yield p;
				}
				
				if (me.logger) {
					me.logger.addData({step: ++logStep,
									x: p.elements[0][0], 
									y: p.elements[0][1], 
									xp: Math.floor(p.elements[0][0]), 
									yp: Math.floor(p.elements[0][1])});
				}
			}
			
			me.__context.fillStyle = oldStyle;
			
			yield null;
		};

		// construction using Bezier shapes
		var bezie = function(points) {
			if ( !points )
				yield null;
			
			var oldStyle = me.__context.fillStyle;
			me.__context.fillStyle = me.methods[me.BEZIE].color;
			
			// format pivots according to scale
			var formatPnts = [];
			for ( var i = 0; i < me.params.dotsCount; i++) {
				formatPnts[i] = {};
				formatPnts[i].x = Math.floor(points[i].x / me.__scale);
				formatPnts[i].y = Math.floor(points[i].y / me.__scale);
			}

			// матрица Безье
			var m = $M([
				[-1, 3, -3, 1], 
				[3, -6, 3, 0], 
				[-3, 3, 0, 0], 
				[1, 0, 0, 0]
			]);
			
			// приращение параметра t
			var step = 1.0 / me.params.iterCount;

			// матрица опорных точек
			var c = $M([
				[formatPnts[0].x, formatPnts[0].y], 
				[formatPnts[1].x, formatPnts[1].y], 
				[formatPnts[2].x, formatPnts[2].y], 
				[formatPnts[3].x, formatPnts[3].y]
			]);

			c = m.x( c );
			
			var v = Matrix.Zero( 1, 4 );		
			var logStep = 0;
			for ( var t = 0; t <= 1; t += step ) {
				v.setElements( [[t * t * t, t * t, t, 1]] );

				p = v.x( c );

				me.constructor.prototype.draw.call(me, {
					x: Math.floor(p.elements[0][0]) * me.__scale, 
					y: Math.floor(p.elements[0][1]) * me.__scale
				}, true);
				
				if (me.stepByStepModeOn) {
					yield p;
				}
			
				if (me.logger) {
					me.logger.addData({step: ++logStep,
									x: p.elements[0][0], 
									y: p.elements[0][1], 
									xp: Math.floor(p.elements[0][0]), 
									yp: Math.floor(p.elements[0][1])});
				}
			}

			// draw pivots
			me.__context.fillStyle = '#000';
			me.__context.globalAlpha = 0.4;
			
			for ( var i = 0; i < points.length; i++ ) {
				me.constructor.prototype.draw.call(me, {
					x: points[i].x, 
					y: points[i].y
				}, false);
			}

			me.__context.fillStyle = oldStyle;
			me.__context.globalAlpha = 1;
			
			yield null;
		};		
		
		var bspline = function* (points) {
			if ( !points || points.length < 4 )
				yield null;		
			
			var oldStyle = me.__context.fillStyle;
			me.__context.fillStyle = me.methods[me.BSPLINE].color;
			
			// format pivots according to scale
			var formatPnts = [];
			for ( var i = 0; i < me.params.dotsCount; i++) {
				formatPnts[i] = {};
				formatPnts[i].x = Math.floor(points[i].x / me.__scale);
				formatPnts[i].y = Math.floor(points[i].y / me.__scale);
			}	
			
			// дополняем множество вершин для замкнутости кривой
			formatPnts.push( formatPnts[0] );
			formatPnts.push( formatPnts[1] );
			formatPnts.push( formatPnts[2] );
			
			// матрица В-сплайна
			var m = $M([
				[-1, 3, -3, 1], 
				[3, -6, 3, 0], 
				[-3, 0, 3, 0], 
				[1, 4, 1, 0]
			]);
			
			// increment of the patameter t
			var step = 1.0 / me.params.iterCount;
			var logStep = 0;
			
			var v = Matrix.Zero( 1, 4 );

			// loop for all points from array points
			for ( var i = 1; i <= formatPnts.length - 3; i++ ) {
				var p1 = formatPnts[ i - 1 ];
				var p2 = formatPnts[ i ];
				var p3 = formatPnts[ i + 1 ];
				var p4 = formatPnts[ i + 2 ];
				
				var c = $M([
					[p1.x, p1.y], 
					[p2.x, p2.y], 
					[p3.x, p3.y], 
					[p4.x, p4.y]
				]);

				c = m.x( c );
				
				// calculates coordinates for segment and draw point
				for( var t = 0; t <= 1; t += step ) {
					v.setElements( [[t * t * t, t * t, t, 1]] );

					p = v.x( c );
					p = p.x( 1/6 );
					
					me.constructor.prototype.draw.call(me, {
						x: Math.floor(p.elements[0][0]) * me.__scale, 
						y: Math.floor(p.elements[0][1]) * me.__scale
					}, true);
					
					if ( me.stepByStepModeOn )
						yield p;
				
					if ( me.logger ) {
						me.logger.addData( {step: ++logStep,
											x: p.elements[0][0], 
											y: p.elements[0][1], 
											xp: Math.floor(p.elements[0][0]), 
											yp: Math.floor(p.elements[0][1])} );
					}
				}
			}
			
			// draw pivots
			me.__context.fillStyle = '#000';
			me.__context.globalAlpha = 0.4;
			
			for ( var i = 0; i < points.length; i++ ) {
				me.constructor.prototype.draw.call(me, {
					x: points[i].x, 
					y: points[i].y
				}, false);
			}

			me.__context.fillStyle = oldStyle;
			me.__context.globalAlpha = 1;			
			
			yield null;
		};		
		
		me.methods = [];
		me.methods[me.ERMIT] = {
			func : ermit,
			color : '#14a614'
		};
		me.methods[me.BEZIE] = { 
			func : bezie,
			color : '#e17d50'
		};
		me.methods[me.BSPLINE] = {
			func : bspline,
			color : '#c450e1'
		};
	},
				    
	draw : function(points) {
		if (this.methods[this.currentMethod])
			this.methods[this.currentMethod].func(points).next();
	},
  	  
	addPoint : function(point) {	  
	  var me = this;
		
		if (!point || this.isExecuting)
			return;
		
		if (me.logger)
			me.logger.clearData();
		
		if (me.points.length < me.params.dotsCount - 1)
			me.points.push(point);
		else {
			me.points.push(point);
			
			if (!me.stepByStepModeOn) {
				me.draw(me.points);
			} else {
				me.isExecuting = true;
				me.makeStep(me.points);
			}	
			
			me.points = [];
		}
	},
	
	makeStep: function(points) {
		var me = this;
		if (me.stepByStepModeOn && me.isExecuting) {
			if (!me.stepByStepFunc) {
				// execute the first step of algorithm 
				me.stepByStepFunc = me.methods[me.currentMethod].func(points);
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
						
	setCurrentMethod : function(method) {
		this.currentMethod = method;
		if (method === this.ERMIT)
			this.params.dotsCount = 2;
		else if (method === this.BEZIE)
			this.params.dotsCount = 4;		  
	},
						
	setCurvesParams : function(params) {
		var me = this;
		
		me.params.iterCount = params.iter || 100;
		
		if (me.currentMethod === me.ERMIT)
			me.params.dotsCount = 2;
		else if (me.currentMethod === this.BEZIE)
			me.params.dotsCount = 4;	
		else
			me.params.dotsCount = params.dots || 6;
		
		if (me.params.dotsCount < 4)
			me.params.dotsCount = 4;
		
		me.params.r1x = params.r1x || 8;
		me.params.r1y = params.r1y || 0;
		me.params.r2x = params.r2x || 0;
		me.params.r2y = params.r2y || 10;
	}
});