(function(){
  'use strict';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var compact=window.matchMedia('(max-width: 900px)').matches;
  var root=document.querySelector('[data-gwm-color-selector]');
  if(!root||reduce)return;

  function clamp(value){return Math.max(0,Math.min(1,value));}
  function easeInOut(value){return value<.5?2*value*value:1-Math.pow(-2*value+2,2)/2;}

  if(compact){
    var mobileFrame=0;
    var mobileScenes=[].slice.call(root.querySelectorAll('.color-scene'));
    function updateMobile(){
      mobileFrame=0;
      var rect=root.getBoundingClientRect();
      var distance=Math.max(1,root.offsetHeight-window.innerHeight);
      var progress=clamp(-rect.top/distance);
      var steps=Math.max(1,mobileScenes.length-1);
      mobileScenes.forEach(function(scene,index){
        if(index===0){scene.style.clipPath='inset(0)';return;}
        var local=clamp(progress*steps-(index-1));
        scene.style.clipPath='inset('+((1-easeInOut(local))*100)+'% 0 0 0)';
      });
    }
    function requestMobile(){if(!mobileFrame)mobileFrame=requestAnimationFrame(updateMobile);}
    window.addEventListener('scroll',requestMobile,{passive:true});
    window.addEventListener('resize',requestMobile,{passive:true});
    updateMobile();
    return;
  }

  if(!window.gsap||!window.ScrollTrigger){
    var desktopFrame=0;
    var desktopScenes=[].slice.call(root.querySelectorAll('.color-scene'));
    function updateDesktopFallback(){
      desktopFrame=0;
      var rect=root.getBoundingClientRect();
      var distance=Math.max(1,root.offsetHeight-window.innerHeight);
      var progress=clamp(-rect.top/distance);
      var steps=Math.max(1,desktopScenes.length-1);
      desktopScenes.forEach(function(scene,index){
        if(index===0)return;
        var local=clamp(progress*steps-(index-1));
        var reveal=easeInOut(local);
        scene.style.clipPath='inset(0 '+((1-reveal)*100)+'% 0 0)';
        var title=scene.querySelector('h2');
        if(title)title.style.transform='translateX('+(-6*(1-reveal))+'%)';
      });
    }
    function requestDesktopFallback(){if(!desktopFrame)desktopFrame=requestAnimationFrame(updateDesktopFallback);}
    window.addEventListener('scroll',requestDesktopFallback,{passive:true});
    window.addEventListener('resize',requestDesktopFallback,{passive:true});
    updateDesktopFallback();
    return;
  }
  var gsap=window.gsap;
  var ScrollTrigger=window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  if(window.Lenis){
    var lenis=new window.Lenis({duration:.38,easing:function(t){return 1-Math.pow(1-t,4);},smoothWheel:true,syncTouch:false,wheelMultiplier:.96});
    lenis.on('scroll',function(){ScrollTrigger.update();});
    gsap.ticker.add(function(time){lenis.raf(time*1000);});
    gsap.ticker.lagSmoothing(0);
  }

  var colorScenes=gsap.utils.toArray(root.querySelectorAll('.color-scene'));
  var colorTimeline=gsap.timeline({
    defaults:{ease:'none'},
    scrollTrigger:{trigger:root,start:'top top',end:'bottom bottom',scrub:.22}
  });
  colorScenes.slice(1).forEach(function(scene,index){
    var at=index;
    colorTimeline
      .to(scene,{clipPath:'inset(0 0% 0 0)',duration:.78,ease:'power2.inOut'},at)
      .fromTo(scene.querySelector('h2'),{xPercent:-6},{xPercent:0,duration:.72,ease:'power2.out'},at+.06);
  });
}());
