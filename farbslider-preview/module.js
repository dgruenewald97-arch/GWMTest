(function(){
  'use strict';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var compact=window.matchMedia('(max-width: 900px)').matches;
  var trimRoot=document.querySelector('[data-trim-compare]');
  var colorRoot=document.querySelector('[data-gwm-color-selector]');
  if(!trimRoot&&!colorRoot)return;
  if(reduce){if(colorRoot)colorRoot.classList.add('is-stage-ready');return;}

  var trimStart=compact?0.26:0.24;
  var trimEnd=compact?0.62:0.56;
  var handoffStart=compact?0.75:0.72;
  var handoffEnd=compact?0.97:0.96;
  var luxury=trimRoot&&trimRoot.querySelector('.trim-scene--luxury');
  var luxuryName=luxury&&luxury.querySelector('.trim-scene__name');
  var luxuryDetails=luxury?[].slice.call(luxury.querySelectorAll('.trim-upgrade,.trim-scene__features--upgrade li')):[];
  var luxuryContent=luxury?[].slice.call(luxury.querySelectorAll('.trim-scene__body,.trim-scene__legal')):[];
  var handoff=trimRoot&&trimRoot.querySelector('.trim-handoff');
  var handoffImage=handoff&&handoff.querySelector('img');
  var handoffTitle=handoff&&handoff.querySelector('h2');
  var handoffUtility=handoff?[].slice.call(handoff.querySelectorAll('span,p')):[];
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
    if(handoff){
      var bridge=easeInOut(range(progress,handoffStart,handoffEnd));
      var bridgeOut=easeInOut(range(bridge,0,.35));
      var imageIn=easeInOut(range(bridge,.16,.82));
      var titleIn=easeInOut(range(bridge,.42,.94));
      var utilityIn=easeInOut(range(bridge,.58,1));
      handoff.style.clipPath='inset(0)';
      handoff.style.opacity=bridge;
      luxuryContent.forEach(function(item){item.style.opacity=1-bridgeOut;item.style.transform='translateY('+(-10*bridgeOut)+'px)';});
      if(handoffImage){handoffImage.style.opacity=imageIn;handoffImage.style.transform='translateY('+((1-imageIn)*6)+'%) scale('+(0.96+imageIn*.04)+')';}
      if(handoffTitle){handoffTitle.style.display=titleIn>.01?'block':'none';handoffTitle.style.visibility=titleIn>.01?'visible':'hidden';handoffTitle.style.opacity=titleIn;handoffTitle.style.transform='translateY('+((1-titleIn)*8)+'%)';}
      handoffUtility.forEach(function(item){item.style.display=utilityIn>.01?'block':'none';item.style.visibility=utilityIn>.01?'visible':'hidden';item.style.opacity=utilityIn;});
    }
  }
  function updateColorsFallback(){
    if(!colorRoot)return;
    var progress=progressFor(colorRoot);
    var steps=Math.max(1,colorScenes.length-1);
    var intro=.11;
    var journey=clamp((progress-intro)/(1-intro));
    colorScenes.forEach(function(scene,index){
      if(index===0){scene.style.clipPath='inset(0)';scene.style.opacity=1;return;}
      var local=journey*steps-(index-1);
      var reveal=easeInOut(range(local,.18,.78));
      scene.style.clipPath=compact?'inset('+((1-reveal)*100)+'% 0 0 0)':'inset(0 '+((1-reveal)*100)+'% 0 0)';
      scene.style.opacity=1;
      var title=scene.querySelector('h2');
      var image=scene.querySelector('img');
      if(title)title.style.transform=(compact?'translateY('+(8*(1-reveal))+'%)':'translateX('+(-4*(1-reveal))+'%)');
      if(image){image.style.opacity=.4+reveal*.6;image.style.transform='scale('+(0.965+reveal*.035)+')';}
    });
  }
  function installUpdater(callback){
    var frame=0;
    function request(){if(!frame)frame=requestAnimationFrame(function(){frame=0;callback();});}
    window.addEventListener('scroll',request,{passive:true});
    window.addEventListener('resize',request,{passive:true});
    callback();
  }
  function updateStageHandoff(){
    if(!colorRoot)return;
    if(!trimRoot){colorRoot.classList.add('is-stage-ready');return;}
    colorRoot.classList.toggle('is-stage-ready',colorRoot.getBoundingClientRect().top<=1);
  }

  installUpdater(updateStageHandoff);

  if(window.gsap&&window.ScrollTrigger){
    var gsap=window.gsap;
    var ScrollTrigger=window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    if(!compact&&window.Lenis){
      var lenis=new window.Lenis({
        duration:.85,
        easing:function(t){return 1-Math.pow(1-t,4);},
        smoothWheel:true,
        syncTouch:false,
        wheelMultiplier:.6,
        virtualScroll:function(data){
          var event=data.event;
          if(!event||!event.type.includes('wheel'))return;
          var rawY=Math.abs(event.deltaY||0);
          var legacyY=Math.abs(event.wheelDeltaY||0);
          var lineWheel=event.deltaMode===1;
          var coarsePixelWheel=event.deltaMode===0&&rawY>=80&&(legacyY===120||Math.abs(rawY/100-Math.round(rawY/100))<.05);
          if(lineWheel)data.deltaY*=1.8;
          else if(coarsePixelWheel)data.deltaY*=1.65;
        }
      });
      lenis.on('scroll',function(){ScrollTrigger.update();});
      gsap.ticker.add(function(time){lenis.raf(time*1000);});
      gsap.ticker.lagSmoothing(0);
    }
    if(trimRoot&&luxury){
      var trimTimeline=gsap.timeline({scrollTrigger:{
        trigger:trimRoot,
        start:'top top',
        end:'bottom bottom',
        scrub:compact ? .24 : .42
      }});
      trimTimeline
        .to({}, {duration:1},0)
        .fromTo(luxury,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:trimEnd-trimStart,ease:'power2.inOut'},trimStart)
        .fromTo(luxuryName,{yPercent:6},{yPercent:0,duration:Math.max(.12,trimEnd-trimStart-.1),ease:'power2.out'},trimStart+.05)
        .fromTo(luxuryDetails,{y:20,opacity:0},{y:0,opacity:1,duration:.1,stagger:.015,ease:'power2.out'},trimStart+.11);
      if(handoff){
        trimTimeline
          .to(luxuryContent,{y:-10,opacity:0,duration:.08,ease:'power1.out'},handoffStart)
          .fromTo(handoff,{clipPath:'inset(0)',opacity:0},{clipPath:'inset(0)',opacity:1,duration:handoffEnd-handoffStart,ease:'power2.inOut'},handoffStart)
          .fromTo(handoffImage,{opacity:0,scale:.96,yPercent:6},{opacity:1,scale:1,yPercent:0,duration:handoffEnd-handoffStart-.05,ease:'power2.out'},handoffStart+.05)
          .set(handoffTitle,{display:'block'},handoffStart+.11)
          .fromTo(handoffTitle,{autoAlpha:0,yPercent:8},{autoAlpha:1,yPercent:0,duration:handoffEnd-handoffStart-.11,ease:'power2.out'},handoffStart+.11)
          .set(handoffUtility,{display:'block'},handoffEnd-.1)
          .fromTo(handoffUtility,{autoAlpha:0},{autoAlpha:1,duration:.08,stagger:.015,ease:'power1.out'},handoffEnd-.1);
      }
    }
    if(colorRoot){
      var colorIntro=.8;
      var colorTransition=.62;
      var colorTotal=colorIntro+Math.max(0,colorScenes.length-1);
      var colorTimeline=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{
        trigger:colorRoot,start:'top top',end:'bottom bottom',scrub:compact ? .2 : .4
      }});
      colorTimeline.to({}, {duration:colorTotal},0);
      colorScenes.slice(1).forEach(function(scene,index){
        var at=colorIntro+index;
        if(compact){
          colorTimeline.fromTo(scene,{clipPath:'inset(100% 0% 0% 0%)',opacity:1},{clipPath:'inset(0% 0% 0% 0%)',opacity:1,duration:colorTransition,ease:'power2.inOut'},at);
        }else{
          colorTimeline.fromTo(scene,{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:colorTransition,ease:'power2.inOut'},at);
        }
        var image=scene.querySelector('img');
        var title=scene.querySelector('h2');
        if(image)colorTimeline.fromTo(image,{opacity:.4,scale:.965},{opacity:1,scale:1,duration:colorTransition-.04,ease:'power2.out'},at+.04);
        if(title)colorTimeline.fromTo(title,compact?{opacity:.25,yPercent:8}:{opacity:.25,xPercent:-4},compact?{opacity:1,yPercent:0,duration:colorTransition-.08,ease:'power2.out'}:{opacity:1,xPercent:0,duration:colorTransition-.08,ease:'power2.out'},at+.08);
      });
    }
    return;
  }

  installUpdater(function(){updateTrimFallback();updateColorsFallback();});
}());
