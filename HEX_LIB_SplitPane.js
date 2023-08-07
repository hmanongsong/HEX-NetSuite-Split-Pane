/*
 * MIT License
 *
 * Copyright (c) 2023 Howell Manongsong
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @Author Howell Manongsong <hhmanongsong@gmail.com>
 */

define([], () => {
  const CONFIG = {
    PANE_LIB_PATH: 'SuiteScripts/HEX_LIB_SplitPane.js',
    NS_ELEMENT_ID: {
      BODY: 'body',
      PAGE_HEADER: 'div__header',
      NAVBAR: 'n-w-header__navigation',
    },
  };

  let paneWidth = 0;

  const toggleSplitPane = (link, width = 50) => {
    paneWidth = width;

    const pageLink = resolveURL(link);
    const leftPane = document.getElementById('left-pane');

    if (!leftPane) {
      buildSplitPane(pageLink);
    } else {
      updatePaneContent(pageLink);
    }

    handlePaneDisplay(link);
  };

  const buildSplitPane = (pageLink) => {
    restructureDOM(pageLink);
    handleIframeEvents();
    initializeMouseEvents();
  };

  const restructureDOM = (pageLink) => {
    const mainBody = document.getElementById(CONFIG.NS_ELEMENT_ID.BODY);
    mainBody.style.display = 'flex';

    const rightPane = wrapAllElements(mainBody, 'right-pane');
    mainBody.appendChild(rightPane);

    const styleHTML = getStyleHTML(pageLink);

    const leftPaneHTML = /*html*/ `
      <div id="left-pane">
        <div id="left-pane-msg-container">
          <h1 id="left-pane-msg">No Preview Available</h1>
        </div>

        <div id="spinner">
          <span id="pane-loader"></span>
        </div>

        <div id="iframe-container">
          <iframe id="iframe-content" src="${pageLink ?? "javascript:''"}" frameborder="0"></iframe>
        </div>
      </div>`;

    const barHTML = /*html*/ `
      <div id="split-bar">
        <div id="grip">
        <div id="tooltip">Double click this bar to open or close the split pane view, or drag it to adjust the size.</div>
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="white" id="pane-grip" viewBox="0 0 15 15">
          <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
        </svg>
        </div>
      </div>`;

    mainBody.insertAdjacentHTML('afterbegin', `${styleHTML}${leftPaneHTML}${barHTML}`);
  };

  const updatePaneContent = (pageLink) => {
    const iframe = document.getElementById('iframe-content');
    iframe.src = pageLink;

    handleIframeEvents();
  };

  const handleIframeEvents = () => {
    const iframe = document.getElementById('iframe-content');
    const leftPaneMessage = document.getElementById('left-pane-msg');

    iframe.onload = (event) => {
      const iframe = event.target;

      const isNoPreview = iframe.src == `javascript:''`;
      const iframeContainer = document.getElementById('iframe-container');

      if (isNoPreview) {
        leftPaneMessage.style.display = 'block';
        iframeContainer.style.visibility = 'hidden';
      } else {
        // If present, get the navbar element inside the iframe and hide it
        const navbar = iframe.contentWindow.document.getElementById(
          CONFIG.NS_ELEMENT_ID.PAGE_HEADER
        );

        if (navbar) {
          navbar.style.display = 'none';
        }

        iframeContainer.style.visibility = 'visible';
      }

      const spinner = document.getElementById('spinner');
      spinner.style.display = 'none';

      iframe.contentWindow.onbeforeunload = () => {
        iframeContainer.style.visibility = 'hidden';
        spinner.style.display = 'block';

        // Hide Pane Message if it exists
        if (leftPaneMessage.style.display !== 'none') {
          leftPaneMessage.style.display = 'none';
        }
      };
    };
  };

  const initializeMouseEvents = () => {
    const leftPane = document.getElementById('left-pane');
    const splitBar = document.getElementById('split-bar');
    const tooltip = document.getElementById('tooltip');
    const iframeOverlay = document.createElement('div');

    iframeOverlay.style.cssText =
      'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;';

    let isMouseDown = false;

    splitBar.addEventListener('mousedown', (event) => {
      isMouseDown = true;

      // Hide tooltip
      tooltip.style.display = 'none';

      // Append iframe overlay to prevent iframe from capturing mouse events
      leftPane.appendChild(iframeOverlay);

      // Handle double click event
      if (event.detail > 1) {
        togglePaneView(leftPane);
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (!isMouseDown) {
        return;
      }

      leftPane.style.width = `${event.clientX}px`;
    });

    document.addEventListener('mouseup', () => {
      isMouseDown = false;

      if (leftPane.contains(iframeOverlay)) {
        leftPane.removeChild(iframeOverlay);
      }
    });

    // Handle Split Bar Tooltip
    const grip = document.querySelector('#grip svg');

    grip.addEventListener('mousemove', (event) => {
      const {clientX: x, clientY: y} = event;
      const {x: boxX, y: boxY} = grip.getBoundingClientRect();

      const mouseLocalX = x - boxX;
      const mouseLocalY = y - boxY;
      const {height} = tooltip.getBoundingClientRect();

      const transformStyle = `translate(${mouseLocalX + 10}px, ${mouseLocalY - height - 5}px)`;
      tooltip.style.transform = transformStyle;
    });

    grip.addEventListener('mouseover', () => {
      tooltip.style.display = isMouseDown ? 'none' : 'initial';
    });

    grip.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  };

  const handlePaneDisplay = (link) => {
    if (!link) {
      return;
    }

    const leftPane = document.getElementById('left-pane');
    const isPaneHidden = leftPane.offsetWidth === 0;

    if (!isPaneHidden) {
      return;
    }

    // Slide pane to view
    togglePaneView(leftPane);
  };

  const togglePaneView = (leftPane) => {
    const mainBody = document.getElementById('body');
    const initialWidth = leftPane.offsetWidth;
    const finalWidth = initialWidth === 0 ? (mainBody.offsetWidth * paneWidth) / 100 : 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / 500, 1);

      const newWidth = initialWidth - (initialWidth - finalWidth) * progress;
      leftPane.style.width = `${newWidth}px`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const generateLink = (label, pageLink, width = 50) => {
    paneWidth = width;

    const clickHandler = getLinkClickHandler(pageLink);
    
    // Remove ifrmcntnr=T from URL, if existing
    pageLink = pageLink.replace(/&ifrmcntnr=T/g, '');
    
    return `<a href="${pageLink}" onclick="${clickHandler}">${label}</a>`;
  };

  const getLinkClickHandler = (pageLink) =>
    `event.preventDefault();require(['${CONFIG.PANE_LIB_PATH}'],(s)=>{try{s.toggleSplitPane('${pageLink}',${paneWidth})}catch(e){window.location='${pageLink}'}});`;

  const wrapAllElements = (target, wrapperId) => {
    const childElements = [...target.childNodes];
    const wrapper = document.createElement('div');
    wrapper.id = wrapperId;

    childElements.forEach((child) => {
      wrapper.appendChild(child);
    });

    return wrapper;
  };

  const getStyleHTML = (pageLink) => {
    const navbar = document.getElementsByClassName(CONFIG.NS_ELEMENT_ID.NAVBAR)[0];

    const barColor = navbar ? window.getComputedStyle(navbar).backgroundColor : '#444444';

    return /*html*/ `
      <style>
        #pane-loader {
          width: 60px;
          height: 60px;
          border: 5px solid ${barColor};
          border-bottom-color: transparent;
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
          position: absolute;
          margin: auto;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
        }

        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        #pane-grip {
          height: 1rem;
          width: 1rem;
          display: inline-block;
          vertical-align: -0.125em;
          fill: white;
          margin: auto;
          font-size: 20px;
        }

        #left-pane {
          position: relative;
          display: flex;
          width: 0%;
          background-color: #F8F8F8;
          overflow: hidden;
        }

        #split-bar {
          background-color: ${barColor};
          width: 15px;
          height: 100%;
          cursor: col-resize;
          display: flex;
        }

        #tooltip {
          position: absolute;
          background-color: #444444;
          padding: 1em;
          color: white;
          font-size: 1em;
          opacity: 0.90;
          top: 50%;
          left: 20px;
          width: 200px;
          border-radius: 5px;
          z-index: 99999;
          display: none;
        }

        #right-pane {
          flex: 1;
          min-width: 0;
          overflow: auto;
        }

        #grip {
          position: relative;
          display: flex;
        }

        #iframe-container {
          visibility: hidden;
          height: 100%;
          width: 100%;
          min-width: 100%;
        }

        #left-pane-msg {
          font-size: 20px;
          color: #4d5f79;
          display: ${pageLink ? 'none' : 'block'};
        }

        #left-pane-msg-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          top: 0;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #spinner {
          margin: auto;
          overflow: hidden;
        }

        #iframe-content {
          position: relative;
          height: 100%;
          width: 100%;
        }
      </style>`;
  };

  const resolveURL = (link) => {
    if (!link) {
      return `javascript:''`;
    }

    // If link is relative, resolve it to absolute URL
    if (link.startsWith('/')) {
      link = `${window.location.origin}${link}`;
    }

    return sameOrigin(link) ? link : `javascript:''`;
  };

  const sameOrigin = (link) => {
    const currentURL = new URL(window.location);
    const pageURL = new URL(link);

    return currentURL.origin === pageURL.origin;
  };

  return {
    toggleSplitPane,
    generateLink,
  };
});
