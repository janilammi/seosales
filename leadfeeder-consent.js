(function () {
  'use strict';

  var storageKey = 'seo_sales_analytics_consent_v2';
  var trackerId = 'Xbp1oaEx1Gb4EdVj';
  var analyticsLoaded = false;

  function getChoice() {
    try { return window.localStorage.getItem(storageKey); }
    catch (error) { return null; }
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    var firstScript = document.getElementsByTagName('script')[0];
    var nalloo = document.createElement('script');
    nalloo.async = true;
    nalloo.src = 'https://nalloo.com/nalloo.min.js';
    nalloo.setAttribute('data-key', '6ddf0916e34a0e8b49f6c13c5ade7e4a');
    firstScript.parentNode.insertBefore(nalloo, firstScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-SJ32DQMVRD');
    var googleAnalytics = document.createElement('script');
    googleAnalytics.async = true;
    googleAnalytics.src = 'https://www.googletagmanager.com/gtag/js?id=G-SJ32DQMVRD';
    firstScript.parentNode.insertBefore(googleAnalytics, firstScript);
    window.ldfdr = window.ldfdr || function () {
      (window.ldfdr._q = window.ldfdr._q || []).push([].slice.call(arguments));
    };
    var trackerScript = document.createElement('script');
    trackerScript.async = true;
    trackerScript.src = 'https://sc.lfeeder.com/lftracker_v1_' + trackerId + '.js';
    var currentFirstScript = document.getElementsByTagName('script')[0];
    currentFirstScript.parentNode.insertBefore(trackerScript, currentFirstScript);
  }

  function setChoice(choice) {
    var saved = false;
    try { window.localStorage.setItem(storageKey, choice); saved = true; }
    catch (error) { /* Without a stored choice, tracking stays off. */ }
    if (choice === 'accepted' && saved) loadAnalytics();
    if (choice === 'rejected' && window.ldfdr && typeof window.ldfdr.optOut === 'function') {
      window.ldfdr.optOut();
    }
    window.location.reload();
  }

  function showNotice() {
    if (document.getElementById('leadfeeder-consent')) return;
    var panel = document.createElement('section');
    panel.id = 'leadfeeder-consent';
    panel.className = 'leadfeeder-consent';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Evästevalinta');
    panel.innerHTML = '<div class="leadfeeder-consent__copy"><strong>Käytämme sivuilla evästeitä.</strong><p>Lue lisää tai muuta asetuksia tietosuojaselosteesta.</p><a href="tietosuojaseloste.html">Tietosuoja ja evästeet</a></div><div class="leadfeeder-consent__actions"><button type="button" class="leadfeeder-consent__accept">Hyväksy kaikki</button><button type="button" class="leadfeeder-consent__reject">Hylkää</button></div>';
    document.body.appendChild(panel);
    panel.querySelector('.leadfeeder-consent__accept').addEventListener('click', function () { setChoice('accepted'); });
    panel.querySelector('.leadfeeder-consent__reject').addEventListener('click', function () { setChoice('rejected'); });
  }

  function addSettingsLink() {
    var footer = document.querySelector('.foot-bottom');
    if (!footer || footer.querySelector('.leadfeeder-consent-settings')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'leadfeeder-consent-settings';
    button.textContent = 'Evästeasetukset';
    button.addEventListener('click', showNotice);
    footer.appendChild(button);
  }

  function initialize() {
    var choice = getChoice();
    addSettingsLink();
    if (choice === 'accepted') loadAnalytics();
    else if (choice !== 'rejected') showNotice();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
}());
