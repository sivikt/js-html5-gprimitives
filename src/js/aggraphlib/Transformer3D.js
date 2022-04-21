Transformer3D = newClass(null, {
    __canvas : null,
                         
    constructor: function() {
        var me = this;  
        
        apply(me, arguments[0]);
      
        me.__points = [];
        me.resetPoints();
    },
                         
    draw3D : function() {
        var me = this;
        
        var context = me.__canvas.getContext('2d');
        context.clearRect(0, 0,  me.__canvas.clientWidth, me.__canvas.clientHeight);
  
        var dimension = 1, a = 0, b = 0;

        for (x = -dimension; x <= dimension; x += dimension)
            for (y = -dimension; y <= dimension; y += dimension)
                for (z = -dimension; z <= dimension; z += dimension)
                {
        
                }
    },
    
    resetPoints : function() {
        var m = $M([
           [2, -2, 1, 1],
           [-3, 3, -2, -1], 
           [0, 0, 1, 0], 
           [1, 0, 0, 0]
        ]);
    },
                         
    activeMouse : function( b ) {
        if (b) {
          
        } else {
          
        }
    }
});
  