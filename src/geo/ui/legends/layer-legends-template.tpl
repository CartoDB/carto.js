<h2 class="CDB-Text CDB-Size-medium is-semibold u-bSpace--xl u-flex u-alignCenter">
  <% if (showLayerSelector) { %>
  <span class="u-iBlock u-rSpace--m">
      <% if (isLayerVisible) { %>
        <input class="CDB-Checkbox js-toggle-layer" type="checkbox" checked>
      <% } else { %>
        <input class="CDB-Checkbox js-toggle-layer" type="checkbox">
      <% } %>
    <span class="u-iBlock CDB-Checkbox-face"></span>
  </span>
  <% } %>
  <span class="u-ellipsis"><%- layerName %></span>
</h2>

<% if (showLegends) { %>
<div class="Legends js-legends">
  
  <div class="CDB-Legend-item">
    <h3 class="CDB-Text CDB-Size-small u-upperCase u-bSpace u-altTextColor">By size</h3>
    <ul class="Spyglass u-flex u-alignCenter">
      <li class="Spyglass-item u-ellipsis" title="220k">
        <div class="Spyglass-lineContent" style="height: 14px;">
          <span class="Spyglass-line" style="height: 4px;"></span>
        </div>
        <p class="CDB-Text CDB-Size-small u-upperCase u-ellipsis u-rSpace">1</p>
      </li>
      <li class="Spyglass-item u-ellipsis" title="220k">
        <div class="Spyglass-lineContent" style="height: 14px;">
          <span class="Spyglass-line" style="height: 6px;"></span>
        </div>
        <p class="CDB-Text CDB-Size-small u-upperCase u-ellipsis">117</p>
      </li>
      <li class="Spyglass-item u-ellipsis" title="220k">
        <div class="Spyglass-lineContent" style="height: 14px;">
          <span class="Spyglass-line" style="height: 8px;"></span>
        </div>
        <p class="CDB-Text CDB-Size-small u-upperCase u-ellipsis u-rSpace">334</p>
      </li>
      <li class="Spyglass-item u-ellipsis" title="220k">
        <div class="Spyglass-lineContent" style="height: 14px;">
          <span class="Spyglass-line" style="height: 10px;"></span>
        </div>
        <p class="CDB-Text CDB-Size-small u-upperCase u-ellipsis u-rSpace">2.8k</p>
      </li>
      <li class="Spyglass-item u-ellipsis" title="220k">
        <div class="Spyglass-lineContent" style="height: 14px;">
          <span class="Spyglass-line" style="height: 12px;"></span>
        </div>
        <p class="CDB-Text CDB-Size-small u-upperCase u-ellipsi u-rSpace">12k</p>
      </li>
      <li class="Spyglass-item u-ellipsis" title="220k">
        <div class="Spyglass-lineContent" style="height: 14px;">
          <span class="Spyglass-line" style="height: 14px;"></span>
        </div>
        <p class="CDB-Text CDB-Size-small u-upperCase u-ellipsis u-rSpace">220k</p>
      </li>
    </ul>
  </div>
</div>
<% } %>