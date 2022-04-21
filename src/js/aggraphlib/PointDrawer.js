PointDrawLogger = newClass(null, {
	printTo : '',
	
	constructor : function() {
		apply(this, arguments[0]);
		
		this.data = [];
	},					   
						   
	addData : function(elem) {
		this.data.push(elem);
	},	
		
	convertData : function() {
	  	var table = '<table><tr><th>x</th><th>y</th><th>Plot(x,y)</th></tr>';
		for (var i = 0; i < this.data.length; i++) {
			table += '<tr><td>' + this.data[i].x + '</td><td>' + 
					 this.data[i].y + '</td><td>Plot(' + this.data[i].xp + ' ,' + this.data[i].yp + ')</td></tr>';
		}
		
		table += '</table>';
		
		return table;
	},
						   
	print : function(printTo) {
		printTo = printTo || this.printTo;
		
		document.getElementById(printTo).innerHTML = this.convertData();
	},
						   
	clearData : function() {
		this.data = [];
	}
});

/**
  This class used to draw points
 */
PointDrawer = newClass(null, {
	__canvas : null,
	
	__RGBIcolor : { R:0, G:0, B:0, I:255 },		
							   
	__webColor : '#000',
							   
	__alpha : 1,						   
	
	__width : 1,
					
	__scale : 1,
					   
	__context : null,
		
	isExecuting : false,
  
  	stepByStepModeOn: false,
  		
  	logger : null,	
  	
	constructor : function() {
		var me = this;
		
		apply(me, arguments[0]);
		
		me.__updateCanvas();
	},
  
	__updateCanvas : function() {
		var me = this;
		if (me.__canvas) {
			me.__context = me.__canvas.getContext('2d');
			me.__context.fillStyle = me.__webColor;
			
			// Opera doesn't support createImageData, so we fake it
			me.__point = me.__context.createImageData ? me.__context.createImageData(1, 1) : { width: 1, height: 1, data: [] };
			me.__point.data[0] = me.__RGBIcolor.R;
			me.__point.data[1] = me.__RGBIcolor.G;
			me.__point.data[2] = me.__RGBIcolor.B;
			me.__point.data[3] = me.__RGBIcolor.I;
			
			me.__canvas.setAttribute('width', me.__canvas.clientWidth);
			me.__canvas.setAttribute('height', me.__canvas.clientHeight);
		} else {
			me.__context = null;
			me.__point = null;
		}
	},
	
	__updateRGBIColor : function() {
		if(me.__point) {
			me.__point.data[0] = me.__RGBIcolor.R;
			me.__point.data[1] = me.__RGBIcolor.G;
			me.__point.data[2] = me.__RGBIcolor.B;
			me.__point.data[3] = me.__RGBIcolor.I;
		}
	},				  
			       
	setCanvas : function(canvas) {
		this.__canvas = canvas;
		this.__updateCanvas();
	},
	
	getCanvas : function() {
		return this.__canvas;
	},
	  
	setRGBIColor : function(rgb) {
		this.__RGBIcolor = rgb;
		this.__updateRGBIColor();
	},
	
	getRGBIColor : function() {
		return this.__RGBIcolor;
	},
	  
	setWidth : function(width) {
		this.__width = width;
	},
	
	getWidth : function() {
		return this.__width;
	},
  	
	draw : function(struct, formatted) { 
		var me = this;
				
		if (formatted)
			me.__context.fillRect(struct.x, 
								  struct.y, 
								  me.__scale, 
								  me.__scale);
		else
			me.__context.fillRect(Math.floor(struct.x / me.__scale) * me.__scale, 
								  Math.floor(struct.y / me.__scale) * me.__scale, 
								  me.__scale, 
								  me.__scale);
	},
  	  
	addPoint : function(point) {
		var me = this;
		var oldStyle = me.__context.fillStyle;
		me.__context.fillStyle = me.__webColor;
	
		me.draw(point);
		
		if (me.logger) {
			me.logger.addData({x: Math.floor(point.x / me.__scale), 
							   y: Math.floor(point.y / me.__scale), 
							   xp: Math.floor(point.x / me.__scale), 
							   yp: Math.floor(point.y / me.__scale)});
		}
		
		me.__context.fillStyle = oldStyle;
	},	  
	
	setScale : function(ds) {
		if (ds < 1)
			this.__scale = 1;
		else 
			this.__scale = Math.round(ds);
	},
		
	setStepByStepModeOn: function(isOn) {
		this.stepByStepModeOn = isOn;
		this.isExecuting = false;
	},
		
	makeStep: function() {					   
	},
					   
	getLogger : function() {
		return this.logger;
	}		
});