import React from 'react';
import { oneLine, stripIndent } from 'common-tags';

var COOKIHUB_SRC = `https://cookiehub.net/cc/`;
var GTAG_SRC = `https://www.googletagmanager.com/gtag/js`;

exports.onRenderBody = (
  { setHeadComponents, setPostBodyComponents },
  pluginOptions
) => {
  if (
    process.env.NODE_ENV !== 'production' ||
    !pluginOptions.cookihubId ||
    !pluginOptions.trackingId
  ) {
    return null;
  }

  var anonymize = pluginOptions.anonymize || false;

  var cookieHubScript = (
    <script
      key="gatsby-plugin-cookihub-cookihub-js"
      src={`${COOKIHUB_SRC}${pluginOptions.cookihubId}.js`}
    />
  );

  var gtagScript = (
    <script
      async
      key="gatsby-plugin-cookihub-gtag-js"
      src={`${GTAG_SRC}?id=${pluginOptions.trackingId}`}
    />
  );

  var setupScriptStr = stripIndent`
    window.GATSBY_PLUGIN_COOKIEHUB_DISABLED_ANALYTICS = true;
  
    window.GATSBY_PLUGIN_COOKIEHUB_GA_TRACKING_ID = (
      '${pluginOptions.trackingId}'
    );
    window.GATSBY_PLUGIN_COOKIEHUB_ANONYMIZE = ${anonymize};

    var options = undefined;

    if (${anonymize}) {
      options = {
        anonymize_ip: true
      };
    }

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());    
  `;

  var setupScript = (
    <script
      key="gatsby-plugin-cookihub-setup"
      dangerouslySetInnerHTML={{ __html: setupScriptStr }}
    />
  );

  var consentScriptStr = stripIndent`
    window.addEventListener("load", function() {
      window.cookieconsent.initialise({
        onInitialise: function(status) {
          if (this.hasConsented('analytics')) {
            window.GATSBY_PLUGIN_COOKIEHUB_DISABLED_ANALYTICS = false;
            gtag('config', '${pluginOptions.trackingId}', options);
          }
        },
        onAllow: function(category) {
          if (category == 'analytics') {
            window.GATSBY_PLUGIN_COOKIEHUB_DISABLED_ANALYTICS = false;
            gtag('config', '${pluginOptions.trackingId}', options);
          }
        },
        onRevoke: function(category) {
          if (category == 'analytics') {
            window.GATSBY_PLUGIN_COOKIEHUB_DISABLED_ANALYTICS = true;
          }
        }
      })
    });  
  `;

  var consentScript = (
    <script
      key="gatsby-plugin-cookihub-consent"
      dangerouslySetInnerHTML={{ __html: consentScriptStr }}
    />
  );

  var setComponents = pluginOptions.head
    ? setHeadComponents
    : setPostBodyComponents;

  return setComponents([
    gtagScript,
    setupScript,
    cookieHubScript,
    consentScript
  ]);
};
