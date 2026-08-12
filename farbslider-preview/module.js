(function(){
  'use strict';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var compact=window.matchMedia('(max-width: 900px)').matches;
  var trimRoot=document.querySelector('[data-trim-compare]');
  var colorRoot=document.querySelector('[data-gwm-color-selector]');
  if(reduce||(!trimRoot&&!colorRoot))return;

  var trimStart=compact?0.26:0.24;
  var trimEnd=compact?0.62:0.56;
  var trimMid=(trimStart+trimEnd)/2;
  var luxury=trimRoot&&trimRoot.querySelector('.trim-scene--luxury');
  var luxuryName=luxury&&luxury.querySelector('.trim-scene__name');
  var luxuryDetails=luxury?[].slice.call(luxury.querySelectorAll('.trim-upgrade,.trim-scene__features--upgrade li')):[];
  var colorScenes=colorRoot?[].slice.call(colorRoot.querySelectorAll('.color-scene')):[];

  function clamp(value){return Math.max(0,Math.min(1,value));}
  function range(value,start,end){return clamp((value-start)/Math.max(.001,end-start));}
  function easeInOut(value){return value<.5?2*value*value:1-Math.pow(-2*value+2,2)/2;}
  function progressFor(root){
    var rect=root.getBoundingClientRect();
    var distance=Math.max(1,root.offsetHeight-window.innerHeight);
    return clamp(-rect.top/distance);
  }
  function updateTrimFallback(){
    if(!trimRoot||!luxury)return;
    var progress=progressFor(trimRoot);
    var reveal=easeInOut(range(progress,trimStart,trimEnd));
    var nameReveal=easeInOut(range(progress,trimStart+.05,trimEnd-.02));
    var detailReveal=easeInOut(range(progress,trimStart+.11,trimEnd+.04));
    luxury.style.clipPath='inset('+((1-reveal)*100)+'% 0 0 0)';
    if(luxuryName)luxuryName.style.transform='translateY('+((1-nameReveal)*6)+'%)';
    luxuryDetails.forEach(function(item,index){
      var itemReveal=clamp(detailReveal-index*.035);
      item.style.opacity=itemReveal;
      item.style.transform='translateY('+((1-itemReveal)*20)+'px)';
    });
  }
  function updateColorsFallback(){
    if(!colorRoot)return;
    var progress=progressFor(colorRoot);
    var steps=Math.max(1,colorScenes.length-1);
    colorScenes.forEach(function(scene,index){
      if(index===0){scene.style.clipPath='inset(0)';return;}
      var local=clamp(progress*steps-(index-1));
      var reveal=easeInOut(local);
      scene.style.clipPath=compact?'inset('+((1-reveal)*100)+'% 0 0 0)':'inset(0 '+((1-reveal)*100)+'% 0 0)';
      if(!compact){
        var title=scene.querySelector('h2');
        if(title)title.style.transform='translateX('+(-6*(1-reveal))+'%)';
      }
    });
  }
  function installUpdater(callback){
    var frame=0;
    function request(){if(!frame)frame=requestAnimationFrame(function(){frame=0;callback();});}
    window.addEventListener('scroll',request,{passive:true});
    window.addEventListener('resize',request,{passive:true});
    callback();
  }

  if(window.gsap&&window.ScrollTrigger){
    var gsap=window.gsap;
    var ScrollTrigger=window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    if(!compact&&window.Lenis){
      var lenis=new window.Lenis({duration:.38,easing:function(t){return 1-Math.pow(1-t,4);},smoothWheel:true,syncTouch:false,wheelMultiplier:.96});
      lenis.on('scroll',function(){ScrollTrigger.update();});
      gsap.ticker.add(function(time){lenis.raf(time*1000);});
      gsap.ticker.lagSmoothing(0);
    }
    if(trimRoot&&luxury){
      var trimTimeline=gsap.timeline({scrollTrigger:{
        trigger:trimRoot,
        start:'top top',
        end:'bottom bottom',
        scrub:.22,
        snap:{
          snapTo:function(progress){return progress>=trimStart&&progress<=trimEnd?(progress<trimMid?trimStart:trimEnd):progress;},
          duration:{min:.12,max:.28},
          delay:.1,
          ease:'power1.out',
          inertia:false
        }
      }});
      trimTimeline
        .to({}, {duration:1},0)
        .fromTo(luxury,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:trimEnd-trimStart,ease:'power2.inOut'},trimStart)
        .fromTo(luxuryName,{yPercent:6},{yPercent:0,duration:Math.max(.12,trimEnd-trimStart-.1),ease:'power2.out'},trimStart+.05)
        .fromTo(luxuryDetails,{y:20,opacity:0},{y:0,opacity:1,duration:.1,stagger:.015,ease:'power2.out'},trimStart+.11);
    }
    if(colorRoot&&!compact){
      var colorTimeline=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:colorRoot,start:'top top',end:'bottom bottom',scrub:.22}});
      colorScenes.slice(1).forEach(function(scene,index){
        var at=index;
        colorTimeline.to(scene,{clipPath:'inset(0 0% 0 0)',duration:.78,ease:'power2.inOut'},at).fromTo(scene.querySelector('h2'),{xPercent:-6},{xPercent:0,duration:.72,ease:'power2.out'},at+.06);
      });
    }else if(colorRoot){
      installUpdater(updateColorsFallback);
    }
    return;
  }

  installUpdater(function(){updateTrimFallback();updateColorsFallback();});
}());
