$(document).delegate('#sorting-animator','pageinit',function () {
  var canvasArray = new Array(); // Canvas array
  var drawTimer; // Dictates rate at which canvas objects are redrawn
  var width = $(window).width(); // Width of window
  var height = $(window).height(); // Height of window
  var algorithm = "selection"; // Algorithm currently being animated
  var numberOfActiveCanvases = 0; // Number of canvases ready to be drawn on
  var baseCanvasIndex = 0; // Visible canvas when no displays are drawn

  // Begin running the sorting animator
  init(); 

  // Initialization sequence
  function init () {
    for (var i = 1; i < 4; i++) {
      $('#sorting-canvas' + (i+1)).hide();
    }
    
    if (!$('#sorting-canvas1')[0] || !$('#sorting-canvas1')[0].getContext) {
      alert('Error: browser does not support HTML5 canvas.');
      return;
    }
    
    // Hide all unneeded elements
    //$('.hide-at-init').hide();   
    
    for (i = 0; i < 4; i++) {
      canvasArray[i] = new Canvas('#sorting-canvas' + (i + 1));
    }
       
    var randomSortingInput = SortingInputGenerator.generateRandomSortingInput(15, 100);
    addCanvas(randomSortingInput, algorithm);
    addCanvas(randomSortingInput, "bubble");
    addCanvas(randomSortingInput, "bubble");
    addCanvas(randomSortingInput, "insertion");
    //removeCanvas(2);
    //removeCanvas(0);
    //addCanvas(randomSortingInput, algorithm);
    
    // Resize all elements on screen
    resizeDivs();    
    
    // Initialise tooltips
    initialiseTooltips("sorting");  
    
    // Initialise click listeners
    initialiseClickListeners();
    
    // Begin drawing on the canvas
    drawTimer = setInterval(function() {draw()}, 25);
  }
  
  // When the window is resized, resize all elements
  $(window).resize(function() {
    // Update window size
    width = $(window).width();
    height = $(window).height();
    resizeDivs();
  });
  
  function initialiseClickListeners() {
    for (var i = 0; i < canvasArray.length; i++) {
      // Virtual mouse click event handler
      $(canvasArray[i].getName()).bind('vclick', function (ev) {
        // Get the mouse position relative to the canvas element
        var cursorX = ev.pageX - this.offsetLeft - 2; // Accommodates border of 2px
        var cursorY = ev.pageY - this.offsetTop - 2; // Accommodates border of 2px
        
        // Get index of the canvas that was clicked on
        var index = ev.target.id.substring(ev.target.id.length-1) - 1;
        
        if (canvasArray[index].getAnimationController().getDisplay().isDeleteClick(cursorX, cursorY)) {
          removeCanvas(index);
        }  
      });
    }
  }  
  
  // Add new algorithm display to the screen
  function addCanvas(randomSortingInput, algorithm) {
    if (numberOfActiveCanvases == 0) {
      //canvasArray[baseCanvasIndex].show();
      numberOfActiveCanvases++;  
      setAnimation(baseCanvasIndex, buckets.arrays.copy(randomSortingInput), algorithm);
    }
    else if (numberOfActiveCanvases > 0 && numberOfActiveCanvases < 4){
      var indexOfNewCanvas = 0;
      for (var i = 0; i < canvasArray.length; i++) {
        if (!canvasArray[i].isActive()) {
          indexOfNewCanvas = i; 
          break;
        }
      }
      canvasArray[indexOfNewCanvas].show();
      numberOfActiveCanvases++;  
      setAnimation(indexOfNewCanvas, buckets.arrays.copy(randomSortingInput), algorithm);
    }   
    resizeDivs();
  }
  
  // Remove algorithm display with given index from the screen
  // NOTE: reason for needing index and specifying the canvas to be removed is 
  // because each canvas will contain a specific view that the user might want
  // removed.
  function removeCanvas(index) {
    // If chosen canvas is not active, remove the first active canvas
    if (!canvasArray[index].isActive()) {
      for (var i = 0; i < canvasArray.length; i++) {
        if (canvasArray[i].isActive()) {
          index = i; 
          break;
        }
      }
    }
    if (index >= 0 && index <= 3 && canvasArray[index].isActive()) {
      canvasArray[index].shutdownDisplay(numberOfActiveCanvases); 
      numberOfActiveCanvases--;
      
      if (numberOfActiveCanvases == 0) {
        baseCanvasIndex = index;
      }
      
      resizeDivs();
    }
  }
     
  // Initialise animation
  function setAnimation(index, sortingInput, algorithm) {
    var newDisplay = new BarGraph(canvasArray[index].getUsableCanvas());
    canvasArray[index].setAnimation(newDisplay, sortingInput, algorithm);
  }
  
  // Resize all elements, unless width is too small
  function resizeDivs() {
    if (width > 500 && height > 500) {       
      // Update canvas size
      updateCanvasArray();
      
      // Update size of other elements
      $('.mode').css('height', (0.06 * height)-1);
      $('.mode').css('line-height', '120%');
      $('#sorting-select-button').css('height', (0.06 * height)-1);
      $('#sorting-select-button').css('line-height', '140%');
      $('#sorting-main-menu').css('line-height', '140%');
      $('#sorting-button-box').height(0.22 * height - 10);
      $('.bottom-left').css('width', 0.7 * width);
      $('#sorting-animation-control-buttons').height(0.18 * height);
      $('#sorting-animation-control-buttons').width(0.3 * width);
      $('#sorting-animation-control-buttons').css("margin-left", (0.7 * width) + 'px');
      $('.control').css("height", 0.4 * ($('#sorting-animation-control-buttons').height()-4));
      $('.control').css("width", (1/6) * ($('#sorting-animation-control-buttons').width()+1));
      $('#sorting-slider-container').css('margin-top', '2px');
      $('#sorting-slider-container').css('width', $('#sorting-animation-control-buttons').width()-14);
      $('#sorting-slider-container').css('height', 0.39 * ($('#sorting-animation-control-buttons').height()-4));
      $('#sorting-slider-label').css('height', 0.5 * ($('#sorting-slider-container').height()-2));
      $('.ownslider + div.ui-slider').css("margin", '0px');
      $('.ownslider + div.ui-slider').css("width", $('#sorting-slider-container').width()-2);
      $('.ownslider + div.ui-slider').css("height", 0.45 * ($('#sorting-slider-container').height()-2));      
    }
  }    
  
  function updateCanvasArray() {
    if (numberOfActiveCanvases == 0) {
      canvasArray[baseCanvasIndex].setHeight(0.72 * height - 4);
      canvasArray[baseCanvasIndex].setWidth(width - 4);
    }
    else {
      floatCanvasArray();
      resizeCanvasArray();
    }
    
    for (var i = 0; i < canvasArray.length; i++) {
      if (canvasArray[i].isActive()) {
        canvasArray[i].getAnimationController().getDisplay().resize();
      }
    }
  }    
    
  function floatCanvasArray() {
    switch (numberOfActiveCanvases) {
      case 0:
        break;
      case 1:
        for (var i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            canvasArray[i].css('float', 'none');
            break;
          }
        }
        break;
      case 2:
        var activeCanvases = 0;
        for (var i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            activeCanvases++;
          }
          if (activeCanvases == 1) {
            canvasArray[i].css('float', 'right');
          }
          else {
            canvasArray[i].css('float', 'none');
          }
        }
        break;
      case 3:
        activeCanvases = 0;
        for (i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            activeCanvases++;
          }
          if (activeCanvases == 1) {
            canvasArray[i].css('float', 'right');
          }
          else {
            canvasArray[i].css('float', 'none');
          }
        }
        break; 
      case 4:
        activeCanvases = 0;
        for (i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            activeCanvases++;
          }
          if (activeCanvases == 1 || activeCanvases == 3) {
            canvasArray[i].css('float', 'right');
          }
          else {
            canvasArray[i].css('float', 'none');
          }
        }
        break;        
    }
  }  
  
  function resizeCanvasArray() {
    switch (numberOfActiveCanvases) {
      case 1:
        for (var i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            canvasArray[i].setHeight(0.72 * height - 4);
            canvasArray[i].setWidth(width - 4);
          }
        }
        break;
      case 2:
        for (i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            canvasArray[i].setHeight(0.72 * height - 4);
            canvasArray[i].setWidth(0.5 * width - 4);
          }
        }
        break;
      case 3:
        var activeCanvases = 0;
        for (i = 0; i < canvasArray.length; i++) {
          canvasArray[i].setHeight(0.36 * height - 4);
          if (canvasArray[i].isActive()) {
            activeCanvases++;
          }
          if (activeCanvases == 3) {
            canvasArray[i].setWidth(width - 4);
          }
          else {
            canvasArray[i].setWidth(0.5 * width - 4);
          }
        }
        break; 
      case 4:
        for (i = 0; i < canvasArray.length; i++) {
          if (canvasArray[i].isActive()) {
            canvasArray[i].setHeight(0.36 * height - 4);
            canvasArray[i].setWidth(0.5 * width - 4);
          }
        }
        break;        
    }
  }  
  
  function pauseAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.pause();
    }
  }
  
  function playAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.play();
    }
  }
  
  function stopAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.play();
    }
  }
  
  function resetAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      canvasArray[i].eraseAnimation();
    }
  }
  
  function nextAll() {        
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.next();
    }
  }
  
  function prevAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.prev();
    }
  }
  
  function startAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.beginning();
    }
  }
  
  function endAll() {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.end();
    }
  }
  
  function setStepDelay(stepsPerMinute) {
    for (var i = 0; i < canvasArray.length; i++) {
      var animationController = canvasArray[i].getAnimationController();
      animationController.setStepDelay(60000 / stepsPerMinute);
    }
  }  
  
  function drawDisplays() {
    for (var i = 0; i < canvasArray.length; i++) {
      if (canvasArray[i].isActive()) {
        canvasArray[i].getAnimationController().getDisplay().draw();
      }
    }   
  }

  // Event listener for when sorting animator page is shown
  $('#sorting-animator').live('pageshow', function () {
    drawTimer = setInterval(function () {draw()}, 25);
    var animationController = canvasArray[0].getAnimationController();
    // What was the animation state when this page was last hidden?
    if (animationController.isPaused()) {
      pauseAll();
    }
    else {
      playAll();
    }
  });

  // Event listener for when sorting animator page is hidden
  $('#sorting-animator').live('pagehide', function () {
    clearInterval(drawTimer);
    var animationController = canvasArray[0].getAnimationController();
    if (animationController.isReady()) {
      stopAll();
    }
  }); 
  
  // When a graph algorithm is selected, update the algorithm to be animated
  $('#sorting-select').change(function () {
    confirm('Do you want to reset the animator?', function(yes) {
      // If user clicked 'OK', reset animator
			if (yes) {
        algorithm = $('#sorting-select option:selected').val();
        stopAll();
        resetAll();
      }
      // If user clicked 'Cancel', return selected algorithm to original value
      else {
        $('#sorting-select').val(algorithm);
        $('#sorting-select').selectmenu("refresh",true);
      }
		});    
  });      
  
  // When 'play' button is clicked, play algorithm and enable 'pause' button
  $('#sorting-play').click(function () {
    playAll();
  });
  
  // When 'pause' button is clicked, pause algortihm and disable 'pause' button
  $('#sorting-pause').click(function () {
    pauseAll();
  });
  
  // When 'next' button is clicked, go to next step of algorithm
  $('#sorting-next').click(function () {
    nextAll();
  });
  
  // When 'prev' button is clicked, go to previous step of algorithm
  $('#sorting-prev').click(function () {
    prevAll();
  });
  
  // When 'start' button is clicked, go to first step of algorithm
  $('#sorting-start').click(function () {
    startAll();
  });
  
  // When 'end' button is clicked, go to end of algorithm
  $('#sorting-end').click(function () {
    endAll();
  });
  
  // 'Change' event handler for slider. Updates step delay value
  $('#sorting-slider').change(function(){
    var stepsPerMinute = $(this).val();
    setStepDelay(stepsPerMinute);
  });    

  // Draws all items to the canvas
  function draw () {
    drawDisplays();
    
    for (var i = 0; i < canvasArray.length; i++) {
      if (canvasArray[i].isMarkedForRemoval()) {
        removeCanvas(i);
      }
    }
  }  
}); 