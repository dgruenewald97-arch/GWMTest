(function(){
  'use strict';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var compact=window.matchMedia('(max-width: 900px)').matches;
  var trimRoot=document.querySelector('[data-trim-compare]');
  var colorRoot=document.querySelector('[data-gwm-color-selector]');
  if(reduce||(!trimRoot&&!colorRoot))return;

  function clamp(value){return Math.max(0,Math.min(1,value));}
  function easeInOut(value){return value<.5?2*value*value:1-Math.pow(-2*value+2,2)/2;}
  function progressFor(root){
    var rect=root.getBoundingClientRect();
    var distance=Math.max(1,root.offsetHeight-window.innerHeight);
    return clamp(-rect.top/distance);
  }

  if(compact){
    var mobileFrame=0;
    var trimScenes=trimRoot?[].slice.call(trimRoot.querySelectorAll('[data-trim-scene]')):[];
    var mobileLuxuryDetails=trimScenes[1]?[].slice.call(trimScenes[1].querySelectorAll('.trim-upgrade,.trim-scene__features--upgrade li')):[];
    var colorScenes=colorRoot?[].slice.call(colorRoot.querySelectorAll('.color-scene')):[];
    function updateMobile(){
      mobileFrame=0;
      if(trimRoot&&trimScenes[1]){
        var trimReveal=easeInOut(progressFor(trimRoot));
        trimScenes[1].style.clipPath='inset('+((1-trimReveal)*100)+'% 0 0 0)';
        var detailReveal=clamp((trimReveal-.22)/.68);
        mobileLuxuryDetails.forEach(function(item,index){
          var itemReveal=clamp(detailReveal-index*.035);
          item.style.opacity=itemReveal;
          item.style.transform='translateY('+((1-itemReveal)*18)+'px)';
        });
      }
      if(colorRoot){
        var colorProgress=progressFor(colorRoot);
        var steps=Math.max(1,colorScenes.length-1);
        colorScenes.forEach(function(scene,index){
          if(index===0){scene.style.clipPath='inset(0)';return;}
          var local=clamp(colorProgress*steps-(index-1));
          scene.style.clipPath='inset('+((1-easeInOut(local))*100)+'% 0 0 0)';
        });
      }
    }
    function requestMobile(){if(!mobileFrame)mobileFrame=requestAnimationFrame(updateMobile);}
    window.addEventListener('scroll',requestMobile,{passive:true});
    window.addEventListener('resize',requestMobile,{passive:true});
    updateMobile();
    return;
  }

  if(window.gsap&&window.ScrollTrigger){
    var gsap=window.gsap;
    var ScrollTrigger=window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    if(window.Lenis){
      var lenis=new window.Lenis({duration:.38,easing:function(t){return 1-Math.pow(1-t,4);},smoothWheel:true,syncTouch:false,wheelMultiplier:.96});
      lenis.on('scroll',function(){ScrollTrigger.update();});
      gsap.ticker.add(function(time){lenis.raf(time*1000);});
      gsap.ticker.lagSmoothing(0);
    }
    if(trimRoot){
      var luxury=trimRoot.querySelector('.trim-scene--luxury');
      if(luxury){
        gsap.timeline({scrollTrigger:{trigger:trimRoot,start:'top top',end:'bottom bottom',scrub:.22}})
          .fromTo(luxury,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1,ease:'power2.inOut'},0)
          .fromTo(luxury.querySelector('.trim-scene__name'),{yPercent:8},{yPercent:0,duration:.85,ease:'power2.out'},.08)
          .fromTo(luxury.querySelectorAll('.trim-upgrade,.trim-scene__features--upgrade li'),{y:28,opacity:0},{y:0,opacity:1,duration:.45,stagger:.035,ease:'power2.out'},.22);
      }
    }
    if(colorRoot){
      var colorScenesGsap=gsap.utils.toArray(colorRoot.querySelectorAll('.color-scene'));
      var colorTimeline=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:colorRoot,start:'top top',end:'bottom bottom',scrub:.22}});
      colorScenesGsap.slice(1).forEach(function(scene,index){
        var at=index;
        colorTimeline.to(scene,{clipPath:'inset(0 0% 0 0)',duration:.78,ease:'power2.inOut'},at).fromTo(scene.querySelector('h2'),{xPercent:-6},{xPercent:0,duration:.72,ease:'power2.out'},at+.06);
      });
    }
    return;
  }

  var desktopFrame=0;
  var trimLuxury=trimRoot&&trimRoot.querySelector('.trim-scene--luxury');
  var desktopLuxuryDetails=trimLuxury?[].slice.call(trimLuxury.querySelectorAll('.trim-upgrade,.trim-scene__features--upgrade li')):[];
  var desktopScenes=colorRoot?[].slice.call(colorRoot.querySelectorAll('.color-scene')):[];
  function updateDesktopFallback(){
    desktopFrame=0;
    if(trimRoot&&trimLuxury){
      var trimReveal=easeInOut(progressFor(trimRoot));
      trimLuxury.style.clipPath='inset('+((1-trimReveal)*100)+'% 0 0 0)';
      var trimName=trimLuxury.querySelector('.trim-scene__name');
      if(trimName)trimName.style.transform='translateY('+(8*(1-trimReveal))+'%)';
      var detailReveal=clamp((trimReveal-.22)/.68);
      desktopLuxuryDetails.forEach(function(item,index){
        var itemReveal=clamp(detailReveal-index*.035);
        item.style.opacity=itemReveal;
        item.style.transform='translateY('+((1-itemReveal)*18)+'px)';
      });
    }
    if(colorRoot){
      var progress=progressFor(colorRoot);
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
  }
  function requestDesktopFallback(){if(!desktopFrame)desktopFrame=requestAnimationFrame(updateDesktopFallback);}
  window.addEventListener('scroll',requestDesktopFallback,{passive:true});
  window.addEventListener('resize',requestDesktopFallback,{passive:true});
  updateDesktopFallback();
}());
