(function () {
  'use strict';

  var storageKey = 'seo_sales_leadfeeder_consent';
  var trackerId = 'Xbp1oaEx1Gb4EdVj';
  var trackerLoaded = false;

  function getChoice() {
    try { return window.localStorage.getItem(storageKey); }
    catch (error) { return null; }
  }

  function loadTracker() {
    if (trackerLoaded) return;
    trackerLoaded = true;
    window.ldfdr = window.ldfdr || function () {
      (window.ldfdr._q = window.ldfdr._q || []).push([].slice.call(arguments));
    };
    var firstScript = document.getElementsByTagName('script')[0];
    var trackerScript = document.createElement('script');
    trackerScript.async = true;
    trackerScript.src = 'https://sc.lfeeder.com/lftracker_v1_' + trackerId + '.js';
    firstScript.parentNode.insertBefore(trackerScript, firstScript);
  }

  function setChoice(choice) {
    var saved = false;
    try { window.localStorage.setItem(storageKey, choice); saved = true; }
    catch (error) { /* Without a stored choice, tracking stays off. */ }
    if (choice === 'accepted' && saved) loadTracker();
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
    panel.setAttribute('aria-label', 'Leadfeederin evästevalinta');
    panel.innerHTML = '<div class="leadfeeder-consent__copy"><strong>Yritysvierailujen analysointi</strong><p>Leadfeeder auttaa tunnistamaan sivustolla vierailevia yrityksiä. Hyväksymällä sallit Leadfeederin seurantakoodin ja analytiikkaevästeet. Voit myös hylätä ne.</p><a href="tietosuojaseloste.html">Lue tietosuojaseloste</a></div><div class="leadfeeder-consent__actions"><button type="button" class="leadfeeder-consent__accept">Hyväksy analytiikkaevästeet</button><button type="button" class="leadfeeder-consent__reject">Hylkää</button></div>';
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
    if (choice === 'accepted') loadTracker();
    else if (choice !== 'rejected') showNotice();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
}());
