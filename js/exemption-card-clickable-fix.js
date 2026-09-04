(() => {
  const STYLE_ID = 'bp-exemption-card-clickable-fix';

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .round-exemption-row{
        display:flex !important;
        flex-direction:row !important;
        align-items:center !important;
        justify-content:flex-start !important;
        gap:12px !important;
        cursor:pointer !important;
      }

      .round-exemption-row-main{
        flex:1 1 auto !important;
        min-width:0 !important;
        align-items:center !important;
      }

      .round-exemption-row-copy{
        flex:1 1 auto !important;
        min-width:0 !important;
      }

      .round-exemption-row-top{
        align-items:flex-start !important;
      }

      .round-exemption-row > .round-exemption-row-state{
        flex:0 0 auto !important;
        margin-left:auto !important;
        align-self:center !important;
        text-align:center !important;
        white-space:nowrap !important;
      }

      .round-exemption-card-chevron{
        display:none !important;
      }

      @media (max-width:600px){
        .round-exemption-row{
          flex-direction:row !important;
          align-items:center !important;
        }

        .round-exemption-row > .round-exemption-row-state{
          max-width:none !important;
          white-space:nowrap !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function fixRow(row){
    if(!(row instanceof HTMLElement)) return;

    row.querySelectorAll('.round-exemption-card-chevron').forEach(node => node.remove());

    const status = row.querySelector('.round-exemption-row-state');
    if(status && status.parentElement !== row){
      row.appendChild(status);
    }

    if(!row.hasAttribute('tabindex')) row.tabIndex = 0;
    if(!row.hasAttribute('role')) row.setAttribute('role','button');
  }

  function apply(root=document){
    if(root.matches?.('.round-exemption-row')) fixRow(root);
    root.querySelectorAll?.('.round-exemption-row').forEach(fixRow);
  }

  function start(){
    injectStyle();
    apply();

    new MutationObserver(mutations => {
      for(const mutation of mutations){
        for(const node of mutation.addedNodes){
          if(node.nodeType === 1) apply(node);
        }
      }
    }).observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  } else {
    start();
  }
})();
