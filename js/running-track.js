"use strict";

(() => {
  const path = document.getElementById("runningTrackPath");
  const marker = document.getElementById("runnerMarker");
  const halo = document.getElementById("runnerHalo");

  if (!path || !marker || !halo) return;

  const totalLength = path.getTotalLength();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lapDuration = 6200;
  let animationId = null;

  function setRunner(progress) {
    const normalized = ((progress % 1) + 1) % 1;
    const point = path.getPointAtLength(normalized * totalLength);
    marker.setAttribute("cx", point.x);
    marker.setAttribute("cy", point.y);
    halo.setAttribute("cx", point.x);
    halo.setAttribute("cy", point.y);
  }

  function animate(timestamp) {
    setRunner((timestamp % lapDuration) / lapDuration);
    animationId = window.requestAnimationFrame(animate);
  }

  function start() {
    if (reduceMotion) {
      setRunner(0.12);
      return;
    }
    if (animationId === null) animationId = window.requestAnimationFrame(animate);
  }

  function stop() {
    if (animationId !== null) {
      window.cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
})();
