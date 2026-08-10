(function(){
  'use strict';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  var compact=window.matchMedia('(max-width: 900px)');
  var roots=[].slice.call(document.querySelectorAll('[data-gwm-color-selector]'));
  var ticking=false;
  function clamp(value){return Math.max(0,Math.min(1,value));}
  function easeInOut(value){return value<.5?2*value*value:1-Math.pow(-2*value+2,2)/2;}
  function updateRoot(root,scenes){
    var rect=root.getBoundingClientRect();
    var distance=Math.max(1,root.offsetHeight-window.innerHeight);
    var progress=clamp(-rect.top/distance);
    var steps=Math.max(1,scenes.length-1);
    scenes.forEach(function(scene,index){
      if(index===0){scene.style.clipPath='inset(0)';return;}
      var local=clamp(progress*steps-(index-1));
      var reveal=easeInOut(local);
      if(compact.matches)scene.style.clipPath='inset('+((1-reveal)*100)+'% 0 0 0)';
      else scene.style.clipPath='inset(0 '+((1-reveal)*100)+'% 0 0)';
    });
  }
  function update(){
    ticking=false;
    if(reduce.matches)return;
    roots.forEach(function(root){updateRoot(root,[].slice.call(root.querySelectorAll('.color-scene')));});
  }
  function requestUpdate(){if(!ticking){ticking=true;requestAnimationFrame(update);}}
  window.addEventListener('scroll',requestUpdate,{passive:true});
  window.addEventListener('resize',requestUpdate,{passive:true});
  compact.addEventListener('change',requestUpdate);
  reduce.addEventListener('change',requestUpdate);
  update();
}());
