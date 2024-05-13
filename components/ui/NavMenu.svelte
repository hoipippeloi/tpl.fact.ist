<script>
    import navConfig from './NavMenuConfig.json';
    export let data;
    let pages = data.pagesManifest.children;

    // Create a new sorted array for items that are found in the config
    let sortedPages = pages
        .filter(page => navConfig.find(cfg => cfg.label === page.label))
        .map(page => ({...page, ...navConfig.find(cfg => cfg.label === page.label)}))
        .filter(page => page.show !== false) 
        .sort((a, b) => a.order - b.order);

    // Create a new array for items that are not found in the config
    let nonConfigPages = pages.filter(page => !navConfig.find(cfg => cfg.label === page.label));
  
    // Combine the two arrays making sure the sorted pages come first
    pages = [...sortedPages, ...nonConfigPages];

    function capitalizeFirstLetter(string) {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
</script>

  
<a class="nav-menu" uk-toggle="target: #offcanvas-nav" href>
  <span uk-icon="icon: menu; ratio: 1"></span>
</a>

<div id="offcanvas-nav" uk-offcanvas="mode: reveal;">
  <div class="uk-offcanvas-bar">
      <ul class="uk-nav uk-nav-default" uk-nav>
          {#each pages as item}
              {#if item.children.length === 0}
                  <li><a href={item.href}>{capitalizeFirstLetter(item.label)}</a></li>
              {/if}
              {#if item.children.length > 0}
                  <li class="uk-parent">
                      <a href>{capitalizeFirstLetter(item.label)} <span uk-nav-parent-icon></span></a>
                      <ul class="uk-nav-sub">
                          {#each item.children as child}
                              {#if child.label}
                                  <li><a href={child.href}>{capitalizeFirstLetter(child.label)}</a></li>
                              {/if}
                          {/each}
                      </ul>
                  </li>
              {/if}
          {/each}
      </ul>
      <button class="uk-offcanvas-close" type="button" uk-close></button>
  </div>
</div>

<style>
.nav-menu {
  z-index:999 !important;
  position: absolute;
  top:14px;
  left:14px;
}
</style>