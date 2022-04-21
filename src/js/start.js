var masterCanvas;
var slaveCanvas;
var gridPattern = null;
var scale = 20;
var activeTopTabId = 'draw-line-btn';
var logElemId = 'logging';
var noGridNoCoords = false;

var pointDrawer;
var lineDrawer;
var circleDrawer;
var ellipseDrawer;
var paraboleDrawer;
var curvesDrawer;
var transform3D;

var pointLogger = new PointDrawLogger({printTo : logElemId});
var lineLogger = new LineDrawLogger({printTo : logElemId});
var circleLogger = new CircleDrawLogger({printTo : logElemId});
var ellipseLogger = new EllipseDrawLogger({printTo : logElemId});
var paraboleLogger = new ParaboleDrawLogger({printTo : logElemId});
var curvesLogger = new CurvesDrawLogger({printTo : logElemId});
  
window.onload = function() {
  masterCanvas = document.getElementById('master-canvas');
  slaveCanvas = document.getElementById('slave-canvas');
  
  pointDrawer = new PointDrawer({
	  __canvas: masterCanvas,
	  __scale : scale,
	  logger : pointLogger
  });

  lineDrawer = new LineDrawer({
	  __canvas: masterCanvas,
	  __scale : scale,
	  logger : lineLogger
  });

  circleDrawer = new CircleDrawer({
	  __canvas: masterCanvas,
	  __webColor : '#0cc6a1',
	  __scale : scale,
	  logger : circleLogger
  });
  setRadius();
  
  ellipseDrawer = new EllipseDrawer({
	  __canvas: masterCanvas,
	  __webColor : '#0cc699',
	  __scale : scale,
	  logger : ellipseLogger
  });
  setEllipseParams();
  
  paraboleDrawer = new ParaboleDrawer({
	  __canvas: masterCanvas,
	  __webColor : '#8979d9',
	  __scale : scale,
	  logger : paraboleLogger
  });
  setParaboleParam();
  
  curvesDrawer = new CurvesDrawer({
	  __canvas: masterCanvas,
	  __webColor : '#890000',
	  __scale : scale,
	  logger : curvesLogger
  });
  setCurvesParams();
  
  transform3D = new Transformer3D({
      __canvas: masterCanvas
  });
  
  var drawers = {
    'draw-point-btn' : {
		drawer : pointDrawer,
        enable : true
	},
    'draw-line-btn' : {
		drawer : lineDrawer,
		sbs : false,
        enable : true
	},
    'draw-circle-btn' : {
		drawer : circleDrawer,
		sbs : false,
        enable : true
	},
    'draw-ellipse-btn' : {
		drawer : ellipseDrawer,
		sbs : false,
        enable : true
	},
    'draw-parabole-btn' : {
		drawer : paraboleDrawer,
		sbs : false,
        enable : true
	},
    'draw-curves-btn' : {
		drawer : curvesDrawer,
		sbs : false,
        enable : true
	},
    'draw-transform-btn' : {
        drawer : null,
        sbs : false,
        enable : false
    }
  };
  
  var drawerId;
  	
  // handles enable/disable step-by-step button
  // and makes step if you have been clicked to the "make step button"
  var onSbsBtn = document.getElementById('on-step-by-step-btn');
  var makeStepBtn = document.getElementById('make-step-btn');
  onSbsBtn.onclick = (
	function() {
		if (onSbsBtn.className.split(' ').length == 2) {
			onSbsBtn.className = 'horizontal-btn';
		
			document.getElementById('onoff-text').innerHTML = 'on sbs';
			
			makeStepBtn.style.display = 'none';
			drawers[drawerId].drawer.setStepByStepModeOn(false);
			drawers[drawerId].sbs = false;
		} else {
			onSbsBtn.className = onSbsBtn.className + ' act-horizontal-btn';
		
			document.getElementById('onoff-text').innerHTML = 'off sbs';
		
			makeStepBtn.style.display = 'block';
			drawers[drawerId].drawer.setStepByStepModeOn(true);
			drawers[drawerId].sbs = true;
		}
	}
  );
  
  makeStepBtn.onclick = (
	function() {
		drawers[drawerId].drawer.makeStep();
	}
  );
  
  /**
	set top buttons click event handlers
  */
  (function() {
    var prevBtn;
    var toolsFeaturesPanel = document.getElementById('tools-features');
	toolsFeaturesPanel.style.display = 'block';
    getElementByClass('top-btn', 'div', function (elem) {
	  // set first btn as active
      if (elem.id == activeTopTabId) {
		prevBtn = elem;
		drawerId = elem.id;
		elem.className = elem.className + ' act-horizontal-btn';
		
		var features = document.getElementById(elem.id + '-features');
		if (features)
		    features.style.display = 'block';
      }
      
      elem.onclick = (
		function(e) {
          noGridNoCoords = false;
          transform3D.activeMouse(false);
          
          if (elem.id == 'draw-point-btn')
            toolsFeaturesPanel.style.display = 'none';
          else if (elem.id == 'draw-transform-btn') {
            toolsFeaturesPanel.style.display = 'none';
            noGridNoCoords = true;
            transform3D.activeMouse(true);
          }
          else
            toolsFeaturesPanel.style.display = 'block';
          
          clearCanvas();
          
          // choose drawer
          drawerId = elem.id;
          elem.className = elem.className + ' act-horizontal-btn';
          
          if (drawers[drawerId].sbs === false) {
              onSbsBtn.className = 'horizontal-btn';		  
              document.getElementById('onoff-text').innerHTML = 'on sbs';
              makeStepBtn.style.display = 'none';
              
              if (drawers[drawerId].drawer)
                  drawers[drawerId].drawer.setStepByStepModeOn(false);
          } else if (drawers[drawerId].sbs === true) {
              onSbsBtn.className = 'horizontal-btn act-horizontal-btn';
              document.getElementById('onoff-text').innerHTML = 'off sbs';
              makeStepBtn.style.display = 'block';
              
              if (drawers[drawerId].drawer)
                  drawers[drawerId].drawer.setStepByStepModeOn(true);
          }
	  
		  // show features panel, if there is...
		  var features = document.getElementById(elem.id + '-features');
		  if (features)
		    features.style.display = 'block';
		  
		  // set previouse button to passive state
		  if (prevBtn && prevBtn.id != elem.id) {
		    prevBtn.className = 'top-btn horizontal-btn';
		    
		    features = document.getElementById(prevBtn.id + '-features');
		    if (features)
		      features.style.display = 'none';
		  }
		  
		  prevBtn = elem;
		}
      );
    });
  })();
  
  /**
	set right buttons click event handlers
	all actions like top button actions
  */
  (function() {
	  getElementByClass('button-container', 'div', function (elem) {
		  for (var i = 0, child; child = elem.childNodes[i]; i++) {
			var childClasses = child.className ? child.className.split(' ') : [];
			var prevBtn;
			(function() {
			  for (var j = 0, cls; cls = childClasses[j]; j++) {
				  if (cls == 'right-btn') {    
					  if (elem.id == 'draw-line-btn-features' && child.id == 'dda') {
						  prevBtn = child;
						  lineDrawer.setAlgorithm(child.id);
					  } else if (elem.id == 'draw-parabole-btn-features' && child.id == 'sqr_y') {
						  prevBtn = child;
						  paraboleDrawer.setCurrentKind(child.id);
					  } else if (elem.id == 'draw-curves-btn-features' && child.id == 'ermit') {
						  prevBtn = child;
						  curvesDrawer.setCurrentMethod(child.id);
					  }
					  
					  var chld = child;
					  child.onclick = function(e) {      	
						  // sets algorith to draw line and sets clicked button to active state
						  if (elem.id == 'draw-line-btn-features')
							  lineDrawer.setAlgorithm(chld.id);	
						  else if (elem.id == 'draw-parabole-btn-features')
							  paraboleDrawer.setCurrentKind(chld.id);
						   else if (elem.id == 'draw-curves-btn-features')
							  curvesDrawer.setCurrentMethod(chld.id);
						  
						  chld.className = chld.className + ' act-vertical-btn';
							
						  if (prevBtn && prevBtn.id != chld.id) {
							  prevBtn.className = 'right-btn vertical-btn';
						  }
						
						  prevBtn = chld;
					  };
				  }
			  }	
			})();
		  }
	  });
  })();
  
  // handles show/hide about program window
  // and makes possible to close it
  (function() {
	var aboutWindow = document.getElementById('about-window');
	
	document.getElementById('about-close-btn').onclick = function() {
		aboutWindow.style.display = 'none';
	};
	
	document.getElementById('show-about-btn').onclick = function() {
		aboutWindow.style.display = 'block';
	};
  })();
  
  // handles canvas mouse click events
  
  masterCanvas.onclick = (
    function(e) {
		// chooses drawer and adds point to draw container
		if (drawers[drawerId] && drawers[drawerId].enable) {
			drawers[drawerId].drawer.addPoint(getMouseOffset(masterCanvas, e)); 
			drawers[drawerId].drawer.getLogger().print();
		}
    }
  );
  
  var currCoordPanel = document.getElementById('current-coord-panel');
  masterCanvas.onmousemove = (
    function(e) {
      var coord = getMouseOffset(masterCanvas, e);
	  currCoordPanel.innerHTML = 'x = ' + Math.floor(coord.x / scale) + ' ::: y = ' + Math.floor(coord.y / scale);
	}
  );
  
  drawAxes(scale);
  drawGrid(scale);
}

/**
  clear canvas from all pictures
*/
function clearCanvas() {
	var context = masterCanvas.getContext('2d');
	context.clearRect(0, 0,  masterCanvas.clientWidth, masterCanvas.clientHeight);

    if (!noGridNoCoords) {
        var oldFStyle = context.fillStyle;
        context.fillStyle = gridPattern;
        context.fillRect(0, 0,  masterCanvas.clientWidth, masterCanvas.clientHeight);
        context.fillStyle = oldFStyle;
    }
}

/**
  draws a grid on the canvas 
*/
function drawGrid(ds) {  
	var context = masterCanvas.getContext('2d');

	context.strokeStyle = '#aeaecc';
	context.lineWidth = 1;

	for (var x = ds; x < masterCanvas.clientWidth; x += ds ) {
		context.moveTo(x, 0);
		context.lineTo(x, masterCanvas.clientHeight);
		context.stroke();
	}

	for (var y = ds; y < masterCanvas.clientWidth; y += ds ) {
		context.moveTo(0, y);
		context.lineTo(masterCanvas.clientWidth, y);
		context.stroke();
	}

	gridPattern = context.createPattern(masterCanvas, 'no-repeat');
}

function drawAxes(ds) {
  	var context = slaveCanvas.getContext('2d');

	var oldStyle = context.fillStyle;
	context.fillStyle = '#313131';

	var scaleHalf = scale / 2;
	var scaleHalfInc = scaleHalf + 2;
	context.fillRect(scaleHalfInc + 3, scaleHalfInc + 3, slaveCanvas.clientWidth - scale, 1);
	context.fillRect(scaleHalfInc + 3, scaleHalfInc + 3, 1, slaveCanvas.clientHeight - scale);
	
	context.fillStyle = '#937d7d';
	for (var x = ds, i = 0; x < slaveCanvas.clientWidth - ds; x += ds, i++ ) {
		context.fillText(i, x + 2, scaleHalf);
	}
	
	for (var y = ds + scale, i = 0; y < slaveCanvas.clientHeight; y += ds, i++ ) {
		context.fillText(i, 0, y - scaleHalf + 4);
	}
	
	context.fillStyle = '#';
	context.fillText('x', slaveCanvas.clientWidth - scaleHalf, scaleHalf);
	context.fillText('y', scaleHalf - 2, slaveCanvas.clientHeight - scaleHalf);
	
	context.fillStyle = oldStyle;
}

function setRadius() {
	circleDrawer.setGlobalRadius(parseInt(document.getElementById('circle-radius-input').value));
}

function setEllipseParams() {
	ellipseDrawer.setGlobalParamA(parseInt(document.getElementById('ellipse-param-a').value));
	ellipseDrawer.setGlobalParamB(parseInt(document.getElementById('ellipse-param-b').value));
}

function setParaboleParam() {
	paraboleDrawer.setGlobalParam(parseInt(document.getElementById('parabole-param').value));
}

function setCurvesParams() {
	curvesDrawer.setCurvesParams({
		r1x : parseInt(document.getElementById('r1x-param').value),
		r1y : parseInt(document.getElementById('r1y-param').value),
		r2x : parseInt(document.getElementById('r2x-param').value),
		r2y : parseInt(document.getElementById('r2y-param').value),
		iter : parseInt(document.getElementById('iter-param').value),
		dots : parseInt(document.getElementById('dots-param').value)
	});
}