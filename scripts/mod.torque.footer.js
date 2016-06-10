
cartodb.moduleLoad('torque', torque);

Profiler = cartodb.core.Profiler

['require', 'define', 'module'].map(function (name) {
  window[name] = window.cartotmp[name];
});

delete window.cartotmp;
