(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const core = window.PixelCraftCore;
  if (!core) return;
  const { state, canvas } = core;
  const toast = msg => core.showToast(msg);
  const iconRefresh = () => { if (window.lucide?.createIcons) window.lucide.createIcons(); };
  const addPanel = (title, note, html='') => {
    const panel = document.createElement('section'); panel.className = 'panel';
    panel.innerHTML = `<div class="panel-section"><div class="section-heading"><div><div class="section-title">${title}</div><div class="section-note">${note}</div></div></div>${html}</div>`;
    return panel;
  };
  const field = (label,id,type='range',value='0',min='0',max='100',extra='') => `<div class="slider-block"><div class="slider-head"><label for="${id}">${label}</label><span class="slider-value" id="${id}Value">${value}${type==='range'?'%':''}</span></div><input id="${id}" type="${type}" value="${value}" min="${min}" max="${max}" ${extra} data-history /></div>`;
  const button = (label, action, icon='sparkles') => `<button type="button" class="secondary-button" data-action="${action}" data-history><i data-lucide="${icon}" style="width:14px;height:14px"></i>${label}</button>`;

  // Reorganize the original editor panels into simple, discoverable editing tabs.
  const sidebar = document.querySelector('.workspace .sidebar');
  const originalPanels = [...sidebar.children].filter(el => el.classList.contains('panel'));
  const resizePanel = originalPanels[0];
  const cropPanel = $('cropPanel');
  const transformPanel = originalPanels.find(el => el.querySelector('#rotateLeft'));
  const watermarkPanel = $('editorWatermarkPanel');
  const exportPanel = originalPanels.find(el => el.querySelector('#downloadButton'));
  const transformSection = transformPanel?.querySelectorAll('.panel-section')[0];
  const adjustSection = transformPanel?.querySelectorAll('.panel-section')[1];

  sidebar.innerHTML = '';
  const tabbar = document.createElement('nav');
  tabbar.className = 'editor-tabbar'; tabbar.id = 'editorTabs'; tabbar.setAttribute('aria-label','Editing tools');
  const leftTabs = [
    ['resize','Crop & Resize','crop'],['adjust','Adjust','sliders-horizontal'],['filters','Filters & Effects','contrast'],
    ['transform','Transform','rotate-cw'],['text','Text & Watermark','type'],['stickers','Stickers & Shapes','shapes'],['frames','Frames & Borders','frame']
  ];
  leftTabs.forEach(([key,label,ico],i)=>{
    const b=document.createElement('button');b.type='button';b.className='editor-tab'+(i===0?' active':'');b.dataset.editorTab=key;
    const iconMarkup=key==='resize'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v12a3 3 0 0 0 3 3h12"/><path d="M18 21V9a3 3 0 0 0-3-3H3"/></svg>':`<i data-lucide="${ico}"></i>`;
    b.innerHTML=`${iconMarkup}<span>${label}</span>`;tabbar.append(b);
  });
  sidebar.append(tabbar);
  const panes={};
  leftTabs.forEach(([key])=>{const p=document.createElement('div');p.className='editor-tab-panel'+(key==='resize'?' active':'');p.dataset.editorPanel=key;panes[key]=p;sidebar.append(p);});
  panes.resize.append(resizePanel,cropPanel);
  if(transformSection){const p=document.createElement('section');p.className='panel';p.append(transformSection);panes.transform.append(p);}
  if(adjustSection){const p=document.createElement('section');p.className='panel';p.append(adjustSection);panes.adjust.append(p);}

  // Extend the Adjust tab with blur, sharpen and vignette controls.
  const adjustExtra = addPanel('Fine adjustments','DETAIL & LIGHT',
    field('Blur','pcBlur','range','0','0','12')+
    field('Sharpen','pcSharpen','range','0','0','100')+
    field('Vignette','pcVignette','range','0','0','100')+
    '<p class="export-note">Blur softens details. Sharpen adds edge definition. Vignette darkens the image corners.</p>');
  panes.adjust.append(adjustExtra);

  // Filters and effects.
  const effectPanel = addPanel('Creative presets','ONE-CLICK LOOKS',`
    <div class="preset-grid" id="pcEffects">
      <button class="preset active" data-effect="normal">Original<small>Neutral</small></button>
      <button class="preset" data-effect="grayscale">Grayscale<small>Monochrome</small></button>
      <button class="preset" data-effect="sepia">Sepia<small>Warm tone</small></button>
      <button class="preset" data-effect="vintage">Vintage<small>Soft warm fade</small></button>
      <button class="preset" data-effect="invert">Invert<small>Negative</small></button>
      <button class="preset" data-effect="duotone">Duotone<small>Two-color look</small></button>
      <button class="preset" data-effect="cyberpunk">Cyberpunk<small>Neon contrast</small></button>
    </div>
    <div class="control-card" style="margin-top:12px"><label class="field-label" for="pcEffectStrength">Effect intensity</label><input id="pcEffectStrength" type="range" min="0" max="100" value="100" data-history/><div class="helper-line"><span>Subtle</span><span id="pcEffectStrengthValue">100%</span></div></div>
    <button class="secondary-button" id="pcResetEffect" type="button" style="width:100%;margin-top:10px" data-history>Reset effect</button>`);
  panes.filters.append(effectPanel);

  // Transform free angle and perspective skew.
  const transformExtra=addPanel('Fine transform','ROTATION & PERSPECTIVE',`
    ${field('Free rotation','pcAngle','range','0','-180','180','step="1"')}
    ${field('Horizontal perspective','pcSkewX','range','0','-35','35','step="1"')}
    ${field('Vertical perspective','pcSkewY','range','0','-35','35','step="1"')}
    <div class="action-row" style="margin-top:14px"><button class="secondary-button" id="pcResetTransform" type="button" data-history>Reset transform</button></div>
    <p class="export-note">Perspective sliders apply a simple affine skew. Extreme values can move parts of an image beyond the canvas.</p>`);
  panes.transform.append(transformExtra);

  // Text styling is added beside the previous watermark controls.
  const textPanel=addPanel('Text styling','TYPE & APPEARANCE',`
    <div class="two-col"><div><label class="field-label" for="textFont">Font family</label><select class="select-control" id="textFont" data-history><option value="Arial">Arial</option><option value="Impact">Impact</option><option value="Georgia">Georgia</option><option value="'Courier New'">Courier New</option><option value="Verdana">Verdana</option><option value="'Trebuchet MS'">Trebuchet</option></select></div><div><label class="field-label" for="textStroke">Stroke width</label><select class="select-control" id="textStroke" data-history><option value="0">None</option><option value="1">Thin</option><option value="2">Medium</option><option value="4">Bold</option><option value="7">Extra bold</option></select></div></div>
    <div class="two-col" style="margin-top:12px"><div><label class="field-label" for="textStrokeColor">Stroke color</label><input id="textStrokeColor" type="color" value="#111827" data-history style="width:100%;height:38px;border:1px solid var(--line);border-radius:9px;background:#101520;padding:4px" /></div><div style="display:flex;align-items:end;padding-bottom:9px"><label style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:8px"><input id="textShadow" type="checkbox" checked data-history/> Drop shadow</label></div></div>
    <p class="export-note">Text is rendered into the final image using the position, color, opacity and size set above.</p>`);
  panes.text.append(watermarkPanel,textPanel);

  // Stickers and shapes panel.
  const stickersPanel=addPanel('Stickers & shapes','ADD A VISUAL ACCENT',`
    <label class="field-label">Quick stickers</label><div class="segmented" id="pcStickerChoices">
      <button type="button" data-sticker="⭐">⭐ Star</button><button type="button" data-sticker="❤️">❤️ Heart</button><button type="button" data-sticker="🔥">🔥 Fire</button><button type="button" data-sticker="✨">✨ Sparkle</button><button type="button" data-sticker="📍">📍 Pin</button><button type="button" data-sticker="😎">😎 Cool</button><button type="button" data-sticker="🏷️">🏷️ Badge</button>
    </div>
    <label class="field-label" style="margin-top:14px">Shapes</label><div class="segmented" id="pcShapeChoices"><button type="button" data-shape="circle">Circle</button><button type="button" data-shape="rect">Rectangle</button><button type="button" data-shape="arrow">Arrow</button><button type="button" data-shape="star">Star</button></div>
    <div class="two-col" style="margin-top:14px"><div><label class="field-label" for="pcOverlayColor">Color</label><input id="pcOverlayColor" type="color" value="#facc15" style="width:100%;height:38px;border:1px solid var(--line);border-radius:9px;background:#101520;padding:4px" data-history/></div><div><label class="field-label" for="pcOverlaySize">Size</label><input id="pcOverlaySize" type="range" min="3" max="35" value="12" data-history/><div class="helper-line"><span id="pcOverlaySizeValue">12%</span></div></div></div>
    <div class="action-row" style="margin-top:14px"><button class="secondary-button" id="pcClearOverlays" type="button" data-history>Clear overlays</button><button class="secondary-button" id="pcRemoveOverlay" type="button" data-history>Remove last</button></div>
    <p class="export-note">New stickers and shapes are placed near the center. Add multiple items, then export the result.</p>`);
  panes.stickers.append(stickersPanel);

  // Frames and borders.
  const framesPanel=addPanel('Frames & borders','FINISH YOUR CANVAS',`
    <label class="field-label" for="pcFrameStyle">Frame style</label><select id="pcFrameStyle" class="select-control" data-history><option value="none">No frame</option><option value="solid">Colored border</option><option value="polaroid">Polaroid</option><option value="double">Double line</option><option value="rounded">Rounded border</option></select>
    <div class="two-col" style="margin-top:12px"><div><label class="field-label" for="pcFrameColor">Frame color</label><input id="pcFrameColor" type="color" value="#a78bfa" data-history style="width:100%;height:38px;border:1px solid var(--line);border-radius:9px;background:#101520;padding:4px"/></div><div><label class="field-label" for="pcFrameWidth">Border width</label><input id="pcFrameWidth" type="range" min="1" max="12" value="4" data-history/><div class="helper-line"><span id="pcFrameWidthValue">4%</span></div></div></div>
    ${field('Corner radius','pcCornerRadius','range','0','0','100')}
    <button class="secondary-button" id="pcResetFrame" type="button" style="width:100%;margin-top:10px" data-history>Reset frame</button>`);
  panes.frames.append(framesPanel);

  // Place the export panel in a dedicated right column.
  const workspace=document.querySelector('.workspace');
  const exportAside=document.createElement('aside'); exportAside.className='export-sidebar'; exportAside.id='exportSidebar';
  exportAside.append(exportPanel);
  const exportSection=exportPanel.querySelector('.panel-section');
  const stats=document.createElement('div'); stats.className='panel'; stats.innerHTML=`<div class="panel-section"><div class="section-heading"><div><div class="section-title">Image information</div><div class="section-note">LIVE OUTPUT DETAILS</div></div></div><div class="export-stat"><span>Dimensions</span><strong id="pcOutputDimensions">—</strong></div><div class="export-stat"><span>Pixel count</span><strong id="pcOutputPixels">—</strong></div><div class="export-stat"><span>Estimated file size</span><strong id="pcOutputSize">—</strong></div><div class="export-stat"><span>Source file</span><strong id="pcSourceSize">—</strong></div><div class="trust-strip" style="margin-top:13px"><i data-lucide="shield-check" style="width:16px;height:16px;flex:0 0 auto"></i><span>100% secure & private. Images are processed locally in this browser.</span></div><button class="secondary-button" id="saveProjectJson" type="button" style="width:100%;margin-top:14px" data-history><i data-lucide="file-json" style="width:14px;height:14px"></i> Save project (JSON)</button><label class="secondary-button" for="loadProjectJson" style="margin-top:8px;cursor:pointer;width:100%"><i data-lucide="folder-open" style="width:14px;height:14px"></i> Load project JSON</label><input id="loadProjectJson" type="file" accept="application/json,.json" hidden /></div>`;
  exportAside.append(stats); workspace.append(exportAside);
  exportAside.querySelectorAll('input,select,button').forEach(el=>{if(el.id!=='pcUndo'&&el.id!=='pcRedo')el.dataset.history='';});

  // Replace editor sidebar interactions with concise tab switching.
  tabbar.addEventListener('click',e=>{
    const b=e.target.closest('[data-editor-tab]');if(!b)return;
    tabbar.querySelectorAll('.editor-tab').forEach(x=>x.classList.toggle('active',x===b));
    Object.entries(panes).forEach(([k,p])=>p.classList.toggle('active',k===b.dataset.editorTab));
    if(b.dataset.editorTab==='resize') core.setCropMode(true,{resetSelection:!state.cropActive});
    else if(state.cropActive) core.setCropMode(false,{silent:true,resetSelection:false});
  });

  // One Crop icon opens the draggable crop frame directly over the image.
  // Apply and Cancel are kept with the Crop & Resize controls; no extra Start button is needed.
  const toolbar=document.querySelector('.canvas-toolbar');
  const toolbarRight=toolbar.querySelector('.toolbar-right');
  const actions=document.createElement('div');actions.className='canvas-actions';actions.innerHTML=`<button class="mini-action" id="pcCropButton" type="button" title="Show crop selection" aria-label="Crop image" aria-pressed="false" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v12a3 3 0 0 0 3 3h12"/><path d="M18 21V9a3 3 0 0 0-3-3H3"/></svg><span>Crop</span></button><button class="mini-action" id="pcUndo" type="button" title="Undo"><i data-lucide="undo-2"></i><span>Undo</span></button><button class="mini-action" id="pcRedo" type="button" title="Redo"><i data-lucide="redo-2"></i><span>Redo</span></button><button class="mini-action" id="pcCompare" type="button" title="Hold to view original"><i data-lucide="eye"></i><span>Hold original</span></button>`;
  toolbarRight.append(actions);
  const zoomTools=document.createElement('div');zoomTools.className='canvas-actions';zoomTools.innerHTML=`<button class="mini-action" id="pcZoomOut" type="button" aria-label="Zoom out" title="Zoom out"><i data-lucide="minus"></i></button><span class="zoom-label" id="pcZoomLabel">100%</span><button class="mini-action" id="pcZoomIn" type="button" aria-label="Zoom in" title="Zoom in"><i data-lucide="plus"></i></button><button class="mini-action" id="pcZoomReset" type="button" title="Reset zoom">Fit</button>`;
  toolbarRight.append(zoomTools);
  $('pcCropButton').addEventListener('click',()=>{
    const cropTab=tabbar.querySelector('[data-editor-tab="resize"]');
    if(cropTab) cropTab.click();
    else core.setCropMode(true,{resetSelection:!state.cropActive});
  });

  // Give editing controls history markers, leaving navigation controls alone.
  sidebar.querySelectorAll('input,select,button').forEach(el=>{ if(!el.matches('.editor-tab') && el.id!=='cancelCrop' && el.id!=='cropRatio') el.dataset.history=''; });
  [ 'widthInput','heightInput','lockButton','fitMode','backgroundMode','applyCrop','rotateLeft','rotateRight','flipH','flipV','resetAdjustments','brightness','contrast','saturation','grayscale','sepia','editorWmText','editorWmPosition','editorWmColor','editorWmOpacity','editorWmSize','formatSelect','quality' ].forEach(id=>$(id)?.setAttribute('data-history',''));

  // Add collage and meme creator panels to the existing extra-tools area.
  const toolNav=document.querySelector('.tool-nav');
  const toolContent=document.querySelector('.tool-content');
  const addToolNav=(id,label,icon)=>{const b=document.createElement('button');b.type='button';b.className='tool-nav-button';b.dataset.tool=id;b.innerHTML=`<i data-lucide="${icon}" style="width:14px;height:14px"></i> ${label}`;toolNav.insertBefore(b,toolNav.querySelector('.tool-nav-note'));};
  addToolNav('collageTool','Collage maker','layout-grid');
  addToolNav('memeTool','Meme generator','type');
  toolNav.addEventListener('click',e=>{const b=e.target.closest('.tool-nav-button[data-tool]');if(!b)return;toolNav.querySelectorAll('.tool-nav-button').forEach(x=>x.classList.toggle('active',x===b));toolContent.querySelectorAll('.tool-panel').forEach(p=>p.classList.toggle('hidden',p.id!==b.dataset.tool));});
  const collage=document.createElement('section');collage.className='tool-panel panel hidden';collage.id='collageTool';collage.innerHTML=`<div class="panel-section"><div class="section-heading"><div><div class="section-title">Collage maker</div><div class="section-note">COMBINE MULTIPLE PHOTOS</div></div><i data-lucide="layout-grid"></i></div><p class="tool-description">Select up to six photos and combine them into a clean grid. Images are fitted and cropped in your browser.</p><label class="field-label" for="pcCollageFiles">Choose photos</label><input class="file-control" type="file" id="pcCollageFiles" accept="image/png,image/jpeg,image/webp" multiple/><div class="two-col tool-fields"><div><label class="field-label" for="pcCollageLayout">Layout</label><select class="select-control" id="pcCollageLayout"><option value="2x2">2 × 2 grid</option><option value="3x1">3 columns</option><option value="2x3">2 × 3 grid</option></select></div><div><label class="field-label" for="pcCollageGap">Spacing</label><select class="select-control" id="pcCollageGap"><option value="0">No gap</option><option value="12" selected>12 px</option><option value="24">24 px</option><option value="36">36 px</option></select></div></div><div class="two-col tool-fields"><div><label class="field-label" for="pcCollageBg">Background</label><input type="color" id="pcCollageBg" value="#171f2d" style="width:100%;height:38px;border:1px solid var(--line);border-radius:9px;background:#101520;padding:4px"/></div><div><label class="field-label" for="pcCollageSize">Canvas size</label><select class="select-control" id="pcCollageSize"><option value="1200">1200 px</option><option value="1600" selected>1600 px</option><option value="2400">2400 px</option></select></div></div><button class="primary-button tool-run" id="pcCreateCollage" type="button">Create collage</button><div class="background-preview-wrap"><canvas id="pcCollageCanvas" style="max-width:100%;height:auto"></canvas></div><button class="secondary-button" id="pcDownloadCollage" type="button" disabled>Download collage</button><div class="tool-status" id="pcCollageStatus" aria-live="polite">Choose two or more photos to start.</div></div>`;
  const meme=document.createElement('section');meme.className='tool-panel panel hidden';meme.id='memeTool';meme.innerHTML=`<div class="panel-section"><div class="section-heading"><div><div class="section-title">Meme generator</div><div class="section-note">TOP & BOTTOM CAPTIONS</div></div><i data-lucide="type"></i></div><label class="field-label" for="pcMemeFile">Choose photo</label><input class="file-control" type="file" id="pcMemeFile" accept="image/png,image/jpeg,image/webp"/><div class="two-col tool-fields"><div><label class="field-label" for="pcMemeTop">Top text</label><input class="text-control" id="pcMemeTop" value="WHEN YOU FINALLY FINISH" maxlength="100"/></div><div><label class="field-label" for="pcMemeBottom">Bottom text</label><input class="text-control" id="pcMemeBottom" value="THE PROJECT" maxlength="100"/></div></div><div class="two-col tool-fields"><div><label class="field-label" for="pcMemeColor">Text color</label><input type="color" id="pcMemeColor" value="#ffffff" style="width:100%;height:38px;border:1px solid var(--line);border-radius:9px;background:#101520;padding:4px"/></div><div><label class="field-label" for="pcMemeSize">Text size</label><input id="pcMemeSize" type="range" min="3" max="12" value="7"/><div class="helper-line"><span id="pcMemeSizeValue">7%</span></div></div></div><div class="background-preview-wrap"><canvas id="pcMemeCanvas" style="max-width:100%;height:auto"></canvas></div><button class="primary-button tool-run" id="pcDownloadMeme" type="button" disabled>Download meme</button><div class="tool-status" id="pcMemeStatus" aria-live="polite">Choose an image to create a meme.</div></div>`;
  toolContent.append(collage,meme);

  // More tools modal navigation.
  const modal=$('moreToolsModal');
  $('openToolsModal')?.addEventListener('click',()=>modal.classList.add('open'));
  $('closeToolsModal')?.addEventListener('click',()=>modal.classList.remove('open'));
  modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open');const card=e.target.closest('[data-open-tool]');if(card){modal.classList.remove('open');document.querySelector('.main-tab[data-view="toolsView"]')?.click();document.querySelectorAll('.tool-nav-button').forEach(b=>b.classList.toggle('active',b.dataset.tool===card.dataset.openTool));document.querySelectorAll('.tool-panel').forEach(p=>p.classList.toggle('hidden',p.id!==card.dataset.openTool));}});

  // Drawing helpers: effects, sharpen, vignette, stickers/shapes and frames.
  const effectStrength=()=>Number($('pcEffectStrength')?.value||100)/100;
  window.PixelCraftApplyEffect=(c,w,h,effect)=>{
    if(effect==='normal')return;
    const s=effectStrength();
    if(effect==='vintage') { c.save();c.globalAlpha=.22*s;c.fillStyle='#b87942';c.fillRect(0,0,w,h);c.globalAlpha=.10*s;c.fillStyle='#fff4d9';c.fillRect(0,0,w,h);c.restore();return; }
    if(effect==='duotone'||effect==='cyberpunk'){
      if(w*h>12000000){c.save();c.globalAlpha=.20*s;c.fillStyle=effect==='duotone'?'#5b4bba':'#ec4899';c.fillRect(0,0,w,h);c.restore();return;}
      try{const image=c.getImageData(0,0,w,h),d=image.data;for(let i=0;i<d.length;i+=4){const lum=(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])/255;let r,g,b;if(effect==='duotone'){r=22+lum*205;g=28+lum*150;b=80+lum*150;}else{r=20+lum*120;g=lum*245;b=75+lum*180;}d[i]=d[i]*(1-s)+r*s;d[i+1]=d[i+1]*(1-s)+g*s;d[i+2]=d[i+2]*(1-s)+b*s;}c.putImageData(image,0,0);}catch(_){}return;
    }
    if(effect==='invert'){c.save();c.globalCompositeOperation='difference';c.fillStyle='#fff';c.globalAlpha=s;c.fillRect(0,0,w,h);c.restore();}
    if(effect==='grayscale'){c.save();c.globalAlpha=s;c.globalCompositeOperation='saturation';c.fillStyle='#777';c.fillRect(0,0,w,h);c.restore();}
    if(effect==='sepia'){c.save();c.globalAlpha=.62*s;c.fillStyle='#b77b43';c.fillRect(0,0,w,h);c.restore();}
  };
  window.PixelCraftVignette=(c,w,h,amount)=>{const g=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.18,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${Math.min(.88,amount/115)})`);c.save();c.fillStyle=g;c.fillRect(0,0,w,h);c.restore();};
  window.PixelCraftSharpen=(c,w,h,amount)=>{
    if(!amount||w*h>18000000)return;
    try{const id=c.getImageData(0,0,w,h),src=id.data,out=new Uint8ClampedArray(src.length),strength=Math.min(1.25,amount/85);out.set(src);for(let y=1;y<h-1;y++){for(let x=1;x<w-1;x++){const i=(y*w+x)*4;for(let k=0;k<3;k++){const v=src[i+k]* (1+4*strength) -(src[i-4+k]+src[i+4+k]+src[i-w*4+k]+src[i+w*4+k])*strength;out[i+k]=v;}out[i+3]=src[i+3];}}id.data.set(out);c.putImageData(id,0,0);}catch(_){}
  };
  window.PixelCraftDrawExtras=(c,w,h,s)=>{
    // Stickers and simple shapes.
    (s.overlays||[]).forEach(o=>{const x=o.x*w,y=o.y*h,size=o.size*Math.min(w,h);c.save();c.translate(x,y);if(o.type==='sticker'){c.font=`${size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;c.textAlign='center';c.textBaseline='middle';c.fillText(o.value,0,0);}else{c.strokeStyle=o.color||'#facc15';c.fillStyle=(o.color||'#facc15')+'33';c.lineWidth=Math.max(4,size*.06);c.lineCap='round';if(o.value==='circle'){c.beginPath();c.arc(0,0,size*.48,0,Math.PI*2);c.fill();c.stroke();}else if(o.value==='rect'){c.fillRect(-size*.5,-size*.32,size,size*.64);c.strokeRect(-size*.5,-size*.32,size,size*.64);}else if(o.value==='arrow'){c.beginPath();c.moveTo(-size*.5,0);c.lineTo(size*.35,0);c.moveTo(size*.08,-size*.28);c.lineTo(size*.38,0);c.lineTo(size*.08,size*.28);c.stroke();}else if(o.value==='star'){drawStar(c,0,0,size*.48,size*.21,5);c.fill();c.stroke();}}c.restore();});
    const f=s.frame||{};if(f.style&&f.style!=='none'){const color=f.color||'#a78bfa';const line=Math.max(3,Math.min(w,h)*(Number(f.width||4)/100));c.save();c.strokeStyle=color;c.lineWidth=line;if(f.style==='polaroid'){c.strokeStyle=color;c.lineWidth=line*2.2;c.strokeRect(line,line,w-line*2,h-line*2);c.fillStyle=color;c.globalAlpha=.20;c.fillRect(w*.06,h*.86,w*.88,h*.12);c.globalAlpha=1;c.strokeStyle=color;c.lineWidth=Math.max(2,line*.45);c.strokeRect(w*.06,h*.06,w*.88,h*.80);}else if(f.style==='double'){c.strokeRect(line/2,line/2,w-line,h-line);c.lineWidth=Math.max(2,line*.28);c.strokeRect(line*1.55,line*1.55,w-line*3.1,h-line*3.1);}else if(f.style==='rounded'){c.lineJoin='round';c.lineCap='round';c.lineWidth=line;c.beginPath();c.roundRect(line/2,line/2,w-line,h-line,Math.min(w,h)*Number(f.radius||0)/250);c.stroke();}else{c.strokeRect(line/2,line/2,w-line,h-line);}c.restore();}
  };
  function drawStar(c,cx,cy,outer,inner,points){c.beginPath();for(let i=0;i<points*2;i++){const r=i%2?inner:outer,a=-Math.PI/2+i*Math.PI/points,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();}

  // History snapshots are flattened canvas states, so undo remains dependable across crop/apply actions.
  const undoStack=[],redoStack=[];let pendingHistory=null;
  function snap(){if(!state.image||!canvas.width||!canvas.height)return null;try{return {data:canvas.toDataURL('image/png'),w:canvas.width,h:canvas.height,fileName:state.fileName};}catch(_){return null;}}
  function historyControl(el){return !!el?.closest('[data-history]');}
  document.addEventListener('pointerdown',e=>{if(historyControl(e.target)){pendingHistory=snap();}},true);
  document.addEventListener('click',e=>{if(e.detail===0&&historyControl(e.target)){pendingHistory=snap();commitHistory();}},true);
  document.addEventListener('pointerup',()=>{if(pendingHistory){setTimeout(commitHistory,80);}},true);
  document.addEventListener('pointercancel',()=>{pendingHistory=null;},true);
  function commitHistory(){if(!pendingHistory)return;undoStack.push(pendingHistory);if(undoStack.length>35)undoStack.shift();redoStack.length=0;pendingHistory=null;updateHistoryButtons();}
  function updateHistoryButtons(){const u=$('pcUndo'),r=$('pcRedo');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length;}
  function restoreSnapshot(s){if(!s)return;if(state.cropActive)core.setCropMode(false,{silent:true,resetSelection:false});const img=new Image();img.onload=()=>{state.image=img;state.originalWidth=s.w;state.originalHeight=s.h;state.rotation=0;state.flipH=false;state.flipV=false;state.blur=0;state.sharpen=0;state.vignette=0;state.effect='normal';state.skewX=0;state.skewY=0;state.overlays=[];state.frame={style:'none',color:'#a78bfa',radius:0,width:4};$('widthInput').value=s.w;$('heightInput').value=s.h;$('fitMode').value='stretch';$('editorWmText').value='';['pcBlur','pcSharpen','pcVignette','pcAngle','pcSkewX','pcSkewY'].forEach(id=>{if($(id))$(id).value=0;});$('pcFrameStyle').value='none';if($('pcFrameWidth'))$('pcFrameWidth').value=4;if($('pcCornerRadius'))$('pcCornerRadius').value=0;$('pcEffectStrength').value=100;core.resetAdjustments(false);core.render();$('fileName').textContent=s.fileName||'Edited image';$('fileDetails').textContent=`${s.w} × ${s.h} px · restored edit`;updateStats();};img.onerror=()=>toast('Could not restore this history step.');img.src=s.data;}
  $('pcUndo').addEventListener('click',()=>{if(!undoStack.length)return;const current=snap();const prev=undoStack.pop();if(current)redoStack.push(current);restoreSnapshot(prev);updateHistoryButtons();toast('Undo applied');});
  $('pcRedo').addEventListener('click',()=>{if(!redoStack.length)return;const current=snap();const next=redoStack.pop();if(current)undoStack.push(current);restoreSnapshot(next);updateHistoryButtons();toast('Redo applied');});
  $('fileInput').addEventListener('change',()=>{undoStack.length=redoStack.length=0;updateHistoryButtons();setTimeout(()=>{['pcBlur','pcSharpen','pcVignette','pcAngle','pcSkewX','pcSkewY'].forEach(id=>{if($(id))$(id).value=0;});if($('pcFrameStyle'))$('pcFrameStyle').value='none';if($('pcEffects'))$('pcEffects').querySelectorAll('.preset').forEach(b=>b.classList.toggle('active',b.dataset.effect==='normal'));if($('pcEffectStrength'))$('pcEffectStrength').value=100;state.frame={style:'none',color:'#a78bfa',radius:0};updateStats();},120);},true);

  // Sliders, effects, transform, sticker, and frame wiring.
  const setState=(id,key,format=true)=>{const el=$(id);if(!el)return;el.addEventListener('input',()=>{state[key]=Number(el.value);const v=$(id+'Value');if(v)v.textContent=el.value+(format?'%':'°');core.render();updateStats();});};
  setState('pcBlur','blur');setState('pcSharpen','sharpen');setState('pcVignette','vignette');setState('pcAngle','rotation',false);setState('pcSkewX','skewX',false);setState('pcSkewY','skewY',false);
  $('pcEffectStrength').addEventListener('input',()=>{$('pcEffectStrengthValue').textContent=$('pcEffectStrength').value+'%';core.render();});
  $('pcEffects').addEventListener('click',e=>{const b=e.target.closest('[data-effect]');if(!b)return;state.effect=b.dataset.effect;$('pcEffects').querySelectorAll('.preset').forEach(x=>x.classList.toggle('active',x===b));core.render();});
  $('pcResetEffect').addEventListener('click',()=>{state.effect='normal';$('pcEffects').querySelectorAll('.preset').forEach(x=>x.classList.toggle('active',x.dataset.effect==='normal'));core.render();});
  $('pcResetTransform').addEventListener('click',()=>{state.rotation=0;state.skewX=state.skewY=0;['pcAngle','pcSkewX','pcSkewY'].forEach(id=>$(id).value=0);core.render();});
  ['textFont','textStroke','textStrokeColor','textShadow'].forEach(id=>$(id).addEventListener('input',()=>core.render()));
  const overlayColor=$('pcOverlayColor'),overlaySize=$('pcOverlaySize');
  overlaySize.addEventListener('input',()=>$('pcOverlaySizeValue').textContent=overlaySize.value+'%');
  function addOverlay(type,value){state.overlays.push({type,value,color:overlayColor.value,size:Number(overlaySize.value)/100,x:.5+(Math.random()-.5)*.18,y:.5+(Math.random()-.5)*.18});core.render();toast('Added to canvas');}
  $('pcStickerChoices').addEventListener('click',e=>{const b=e.target.closest('[data-sticker]');if(b)addOverlay('sticker',b.dataset.sticker);});
  $('pcShapeChoices').addEventListener('click',e=>{const b=e.target.closest('[data-shape]');if(b)addOverlay('shape',b.dataset.shape);});
  $('pcClearOverlays').addEventListener('click',()=>{state.overlays=[];core.render();});
  $('pcRemoveOverlay').addEventListener('click',()=>{state.overlays.pop();core.render();});
  $('pcFrameStyle').addEventListener('change',()=>{state.frame.style=$('pcFrameStyle').value;state.frame.color=$('pcFrameColor').value;state.frame.width=Number($('pcFrameWidth').value);state.frame.radius=Number($('pcCornerRadius').value);core.render();});
  $('pcFrameColor').addEventListener('input',()=>{state.frame.color=$('pcFrameColor').value;core.render();});
  $('pcFrameWidth').addEventListener('input',()=>{state.frame.width=Number($('pcFrameWidth').value);$('pcFrameWidthValue').textContent=$('pcFrameWidth').value+'%';core.render();});
  $('pcCornerRadius').addEventListener('input',()=>{state.frame.radius=Number($('pcCornerRadius').value);$('pcCornerRadiusValue').textContent=$('pcCornerRadius').value+'%';core.render();});
  $('pcResetFrame').addEventListener('click',()=>{state.frame={style:'none',color:'#a78bfa',radius:0,width:4};$('pcFrameStyle').value='none';$('pcCornerRadius').value=0;$('pcFrameWidth').value=4;core.render();});

  // Zoom and pan interactions.
  let zoom=1,panX=0,panY=0,panStart=null;
  function paintZoom(){canvas.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`; $('pcZoomLabel').textContent=Math.round(zoom*100)+'%';}
  function setZoom(v){zoom=Math.max(.35,Math.min(3,Math.round(v*100)/100));paintZoom();if(state.cropActive)window.dispatchEvent(new Event('resize'));}
  $('pcZoomIn').addEventListener('click',()=>setZoom(zoom+.15));$('pcZoomOut').addEventListener('click',()=>setZoom(zoom-.15));$('pcZoomReset').addEventListener('click',()=>{panX=panY=0;setZoom(1);});
  $('dropZone').addEventListener('wheel',e=>{if(!state.image)return;e.preventDefault();setZoom(zoom+(e.deltaY<0?.08:-.08));},{passive:false});
  canvas.addEventListener('pointerdown',e=>{if(!state.image||state.cropActive||zoom<=1.02)return;panStart={x:e.clientX,y:e.clientY,px:panX,py:panY};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';});
  canvas.addEventListener('pointermove',e=>{if(!panStart)return;panX=panStart.px+e.clientX-panStart.x;panY=panStart.py+e.clientY-panStart.y;paintZoom();if(state.cropActive)window.dispatchEvent(new Event('resize'));});
  ['pointerup','pointercancel'].forEach(ev=>canvas.addEventListener(ev,()=>{panStart=null;canvas.style.cursor=zoom>1.02?'grab':'default';}));

  // Hold to compare against the original of the current edit stage.
  const compare=$('pcCompare');let comparing=false;
  function showOriginal(){if(comparing||!state.originalImage)return;const img=state.originalImage;const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;if(w*h>80000000){toast('Original image is too large to compare in one preview.');return;}comparing=true;canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');c.clearRect(0,0,w,h);c.drawImage(img,0,0,w,h);$('statusText').textContent='Viewing original image';}
  function restoreEdited(){if(!comparing)return;comparing=false;core.render();$('statusText').textContent='Edited preview restored';}
  compare.addEventListener('pointerdown',e=>{e.preventDefault();showOriginal();});['pointerup','pointerleave','pointercancel'].forEach(ev=>compare.addEventListener(ev,restoreEdited));compare.addEventListener('contextmenu',e=>e.preventDefault());

  // Export information, project JSON save/load.
  function fmt(bytes){if(!Number.isFinite(bytes))return '—';if(bytes<1024)return bytes+' B';if(bytes<1048576)return (bytes/1024).toFixed(1)+' KB';return (bytes/1048576).toFixed(2)+' MB';}
  let statsTimer=null;
  function updateStats(){if(!canvas.width||!canvas.height)return;$('pcOutputDimensions').textContent=`${canvas.width} × ${canvas.height} px`;$('pcOutputPixels').textContent=(canvas.width*canvas.height/1e6).toFixed(2)+' MP';$('pcSourceSize').textContent=$('fileDetails').textContent.split('·').pop()?.trim()||'—';clearTimeout(statsTimer);statsTimer=setTimeout(()=>{try{canvas.toBlob(b=>{if(b)$('pcOutputSize').textContent=fmt(b.size);},$('formatSelect').value,Number($('quality').value)/100);}catch(_){$('pcOutputSize').textContent='—';}},260);}
  document.addEventListener('input',e=>{if(e.target.closest('.workspace'))requestAnimationFrame(()=>requestAnimationFrame(updateStats));});
  document.addEventListener('click',e=>{if(e.target.closest('.workspace'))requestAnimationFrame(()=>requestAnimationFrame(updateStats));});
  $('saveProjectJson').addEventListener('click',()=>{if(!state.image){toast('Upload a photo before saving a project.');return;}try{const project={app:'PixelCraft Studio',version:1,savedAt:new Date().toISOString(),imageData:canvas.toDataURL('image/png'),fileName:state.fileName,output:{width:canvas.width,height:canvas.height,format:$('formatSelect').value,quality:Number($('quality').value)},settings:{fitMode:$('fitMode').value,backgroundMode:$('backgroundMode').value,brightness:$('brightness').value,contrast:$('contrast').value,saturation:$('saturation').value,grayscale:$('grayscale').value,sepia:$('sepia').value,blur:state.blur,sharpen:state.sharpen,vignette:state.vignette,effect:state.effect,rotation:state.rotation,skewX:state.skewX,skewY:state.skewY,overlays:state.overlays,frame:state.frame}};const blob=new Blob([JSON.stringify(project)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=(state.fileName||'pixelcraft-project').replace(/\.[^.]+$/,'')+'.pixelcraft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Project JSON saved.');}catch(err){toast('Could not save project: '+err.message);}});
  $('loadProjectJson').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const project=JSON.parse(await file.text());if(project.app!=='PixelCraft Studio'||!project.imageData)throw new Error('This is not a PixelCraft project file.');const img=new Image();img.onload=()=>{state.image=img;state.originalImage=img;state.fileName=project.fileName||file.name;state.rotation=0;state.flipH=state.flipV=false;state.blur=0;state.sharpen=0;state.vignette=0;state.overlays=[];state.frame={style:'none',color:'#a78bfa',radius:0};$('widthInput').value=project.output?.width||img.width;$('heightInput').value=project.output?.height||img.height;$('fitMode').value='stretch';$('fileName').textContent=state.fileName;$('fileDetails').textContent=`${img.width} × ${img.height} px · project loaded`;$('emptyState').classList.add('hidden');canvas.style.display='block';$('downloadButton').disabled=false;core.resetAdjustments(false);core.render();updateStats();toast('Project loaded. It was restored as an editable image layer.');};img.src=project.imageData;}catch(err){toast(err.message||'Could not load project.');}finally{e.target.value='';}});

  // Collage creator.
  let collageFiles=[],collageBitmaps=[];
  const collageCanvas=$('pcCollageCanvas');
  $('pcCollageFiles').addEventListener('change',e=>{collageFiles=[...e.target.files].slice(0,6);$('pcCollageStatus').textContent=`${collageFiles.length} photo(s) selected. Up to six will be used.`;});
  $('pcCreateCollage').addEventListener('click',async()=>{if(collageFiles.length<2){$('pcCollageStatus').textContent='Choose at least two photos.';return;}try{collageBitmaps.forEach(b=>b.close?.());collageBitmaps=[];for(const f of collageFiles)collageBitmaps.push(await createImageBitmap(f));const [cols,rows]=$('pcCollageLayout').value.split('x').map(Number);const size=Number($('pcCollageSize').value),gap=Number($('pcCollageGap').value);const cellW=Math.floor((size-gap*(cols+1))/cols),cellH=Math.floor((size-gap*(rows+1))/rows);collageCanvas.width=size;collageCanvas.height=Math.round(cellH*rows+gap*(rows+1));const c=collageCanvas.getContext('2d');c.fillStyle=$('pcCollageBg').value;c.fillRect(0,0,collageCanvas.width,collageCanvas.height);const used=collageBitmaps.slice(0,cols*rows);used.forEach((img,i)=>{const x=gap+(i%cols)*(cellW+gap),y=gap+Math.floor(i/cols)*(cellH+gap);const scale=Math.max(cellW/img.width,cellH/img.height),dw=img.width*scale,dh=img.height*scale;c.save();c.beginPath();c.rect(x,y,cellW,cellH);c.clip();c.drawImage(img,x+(cellW-dw)/2,y+(cellH-dh)/2,dw,dh);c.restore();});$('pcDownloadCollage').disabled=false;$('pcCollageStatus').textContent=`Collage created · ${used.length} of ${collageFiles.length} selected photo(s) used by this layout · ${collageCanvas.width} × ${collageCanvas.height} px.`;}catch(err){$('pcCollageStatus').textContent=err.message||'Unable to create collage.';}});
  $('pcDownloadCollage').addEventListener('click',()=>collageCanvas.toBlob(blob=>{if(!blob){$('pcCollageStatus').textContent='Could not create the collage download. Try a smaller canvas size.';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pixelcraft-collage.jpg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);$('pcCollageStatus').textContent='Collage download prepared.';},'image/jpeg',.92));

  // Meme generator.
  let memeBitmap=null;const memeCanvas=$('pcMemeCanvas');
  async function renderMeme(){if(!memeBitmap)return;const w=memeBitmap.width,h=memeBitmap.height;memeCanvas.width=w;memeCanvas.height=h;const c=memeCanvas.getContext('2d');c.drawImage(memeBitmap,0,0);const size=Math.max(24,Math.round(Math.min(w,h)*Number($('pcMemeSize').value)/100));c.font=`900 ${size}px Impact, Arial Black, sans-serif`;c.textAlign='center';c.textBaseline='top';c.lineJoin='round';c.lineWidth=Math.max(3,size*.11);c.strokeStyle='#000';c.fillStyle=$('pcMemeColor').value;const wrap=(text,max)=>{const words=(text||'').toUpperCase().split(/\s+/);let lines=[],line='';for(const word of words){const test=line?line+' '+word:word;if(c.measureText(test).width>max&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);return lines.slice(0,3);};const margin=w*.05,top=wrap($('pcMemeTop').value,w-margin*2),bottom=wrap($('pcMemeBottom').value,w-margin*2);top.forEach((line,i)=>{const y=h*.035+i*size*1.05;c.strokeText(line,w/2,y);c.fillText(line,w/2,y);});bottom.forEach((line,i)=>{const y=h-size*1.15*(bottom.length-i)-h*.035;c.strokeText(line,w/2,y);c.fillText(line,w/2,y);});$('pcDownloadMeme').disabled=false;}
  $('pcMemeFile').addEventListener('change',async e=>{try{memeBitmap?.close?.();memeBitmap=e.target.files[0]?await createImageBitmap(e.target.files[0]):null;await renderMeme();$('pcMemeStatus').textContent=memeBitmap?'Meme preview ready.':'Choose an image.';}catch(err){$('pcMemeStatus').textContent=err.message;}});
  ['pcMemeTop','pcMemeBottom','pcMemeColor','pcMemeSize'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='pcMemeSize')$('pcMemeSizeValue').textContent=$(id).value+'%';renderMeme();}));
  $('pcDownloadMeme').addEventListener('click',()=>memeCanvas.toBlob(blob=>{if(!blob){$('pcMemeStatus').textContent='Could not create the meme download. Try a smaller source image.';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pixelcraft-meme.jpg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);$('pcMemeStatus').textContent='Meme download prepared.';},'image/jpeg',.94));

  // Multi-file opening routes users to batch resize; single files continue into the editor.
  function routeBatch(files){if(!files||files.length<2)return;const selected=[...files].slice(0,30);document.querySelector('.main-tab[data-view="toolsView"]')?.click();document.querySelectorAll('.tool-nav-button').forEach(b=>b.classList.toggle('active',b.dataset.tool==='batchTool'));document.querySelectorAll('.tool-panel').forEach(p=>p.classList.toggle('hidden',p.id!=='batchTool'));try{const dt=new DataTransfer();selected.forEach(f=>dt.items.add(f));$('batchResizeFiles').files=dt.files;$('batchResizeStatus').textContent=`${selected.length} images ready for batch resizing. Choose an output preset and click Resize selected photos.`;}catch(error){$('batchResizeStatus').textContent='Your browser could not transfer the selected files into the batch picker. Use Choose photos in this panel to select them directly.';toast('Use the Batch resize picker to select multiple files.');}}
  $('fileInput').addEventListener('change',e=>routeBatch(e.target.files),true);
  $('dropZone').addEventListener('drop',e=>{if(e.dataTransfer?.files?.length>1)routeBatch(e.dataTransfer.files);},true);

  // Privacy preferences: essential storage only by default. Advertising is loaded
  // only after explicit consent; analytics is not integrated.
  const consent=$('cookieConsent'), consentKey='pixelcraft-consent-v2';
  let consentState={choice:'unset',essential:true,analytics:false,advertising:false,updatedAt:null};
  function readConsent(){
    try{
      const current=localStorage.getItem(consentKey);
      if(current){const parsed=JSON.parse(current);return {...consentState,...parsed,essential:true};}
      const legacy=localStorage.getItem('pixelcraft-cookie-choice');
      if(legacy){const parsed=JSON.parse(legacy);const migrated={...consentState,choice:parsed.choice||'legacy',analytics:Boolean(parsed.analytics),advertising:Boolean(parsed.advertising),updatedAt:parsed.at||null};localStorage.setItem(consentKey,JSON.stringify(migrated));return migrated;}
    }catch(_){/* If storage is unavailable, show the banner and keep choices in memory. */}
    return consentState;
  }
  consentState=readConsent();
  const paintConsentControls=()=>{$('pcConsentAnalytics').checked=Boolean(consentState.analytics);$('pcConsentAds').checked=Boolean(consentState.advertising);};
  const emitConsent=()=>window.dispatchEvent(new CustomEvent('pixelcraft:consentchange',{detail:{...consentState}}));

  // Basic script gate: do not request AdSense until advertising is explicitly enabled.
  // This is not a Google-certified consent-management platform (CMP).
  const ADSENSE_CLIENT='ca-pub-2287896200203519';
  let adsenseLoadStarted=false;
  function loadAdSenseAfterConsent(){
    if(!consentState.advertising || adsenseLoadStarted || document.getElementById('pixelcraft-adsense-script')) return;
    adsenseLoadStarted=true;
    window.adsbygoogle=window.adsbygoogle||[];
    window.adsbygoogle.requestNonPersonalizedAds=1;
    const script=document.createElement('script');
    script.id='pixelcraft-adsense-script';
    script.async=true;
    script.crossOrigin='anonymous';
    script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+ADSENSE_CLIENT;
    script.onerror=()=>{adsenseLoadStarted=false;script.remove();};
    document.head.appendChild(script);
  }
  const saveConsent=(choice,analytics=false,ads=false)=>{
    consentState={choice,essential:true,analytics:Boolean(analytics),advertising:Boolean(ads),updatedAt:new Date().toISOString()};
    try{localStorage.setItem(consentKey,JSON.stringify(consentState));}catch(_){toast('Your preference is active for this visit, but browser storage is unavailable.');}
    if(consentState.advertising)loadAdSenseAfterConsent();
    paintConsentControls();$('consentPreferences').hidden=true;$('cookieSettings').setAttribute('aria-expanded','false');consent.classList.remove('show');emitConsent();
  };
  window.PixelCraftConsent={get:()=>({...consentState}),allows:category=>category==='essential'?true:category==='analytics'?Boolean(consentState.analytics):category==='advertising'?Boolean(consentState.advertising):false};
  paintConsentControls();
  if(consentState.choice==='unset')consent.classList.add('show');
  if(consentState.advertising)loadAdSenseAfterConsent();
  $('acceptCookies').addEventListener('click',()=>saveConsent('accepted-optional',true,true));
  $('rejectCookies').addEventListener('click',()=>saveConsent('essential-only',false,false));
  $('cookieSettings').addEventListener('click',()=>{const panel=$('consentPreferences');panel.hidden=!panel.hidden;$('cookieSettings').setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)paintConsentControls();});
  $('saveCookiePrefs').addEventListener('click',()=>saveConsent('custom',$('pcConsentAnalytics').checked,$('pcConsentAds').checked));
  $('openCookieSettingsFooter').addEventListener('click',()=>{paintConsentControls();$('consentPreferences').hidden=false;$('cookieSettings').setAttribute('aria-expanded','true');consent.classList.add('show');$('consentTitle').focus?.();});

  // Track app initialization and ensure all icons render.
  iconRefresh();
  updateHistoryButtons();
  const mainUpload=$('mainUpload');mainUpload?.insertAdjacentHTML('beforebegin','<div class="trust-strip" style="justify-content:center;margin-bottom:13px"><i data-lucide="shield-check" style="width:15px;height:15px"></i> 100% Secure &amp; Private · files stay on your device</div>');
  // Update output stats after original scripts finish image loading.
  const origFileChange=$('fileInput');origFileChange.addEventListener('change',()=>setTimeout(updateStats,80));
  const obs=new MutationObserver(()=>{if(canvas.width)updateStats();});obs.observe(canvas,{attributes:true,attributeFilter:['width','height']});
  iconRefresh();
})();
