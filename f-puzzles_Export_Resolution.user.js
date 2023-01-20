// ==UserScript==
// @name         Fpuzzles-Custom_Image_Resolution
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Allows for custom resolutions for exported images. 
// @author       Ennead
// @match        https://*.f-puzzles.com/*
// @match        https://f-puzzles.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const doShim = function() {

        let resInputAttr = {
                             'id': 'resInput', 
                             'placeholder': 'pixels',
                             'style': 'width: 5vw;' +
                                      'margin: 0 1.5vw;' +
                                      'border: 4px solid black;' +
                                      'font-size: 16px;' +
                                      'outline: none;' +
                                      'position: fixed;' +
                                      'display: none;'
                            }
        const resInput = document.createElement('input');
        for (let key in resInputAttr) { resInput.setAttribute(key, resInputAttr[key]); }
        document.body.appendChild(resInput);

        let prevTogglePopup = togglePopup;
        togglePopup = function(title) {
            prevTogglePopup(title);
            if (title === 'Export') {

                const dlButton = buttons.filter(b => b.id === 'Download')[0];
                dlButton.x = canvas.width/2 - 225;
                dlButton.w = 300;

                const resInput = document.getElementById('resInput');
                resInput.style.display = 'block';
                resInput.style.left = (100 * ((dlButton.x + dlButton.w/2)/canvas.width)) + '%';
                resInput.style.top = (100 * (dlButton.y/canvas.height)) + '%';
                resInput.style.height = (100 * (buttonLH/canvas.height)) + '%';
                resInput.value = '';
            }
        }

        let prevClosePopups = closePopups;
        closePopups = function(title) {
            prevClosePopups(title);
            document.getElementById('resInput').style.display = 'none';
        }

        let prevDownload = download;
        download = function(screenshot, customFileName) {
            togglePreview(screenshot);
            
            ctx = canvas2.getContext('2d');
            canvas2.width = canvas.width;
            canvas2.height = canvas.height;
            ctx.textAlign = 'center';
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawGrid();
            
            ctx = canvas3.getContext('2d');

            let customResolution = document.getElementById('resInput').value;

            if (customResolution) {
                canvas3.width = customResolution;
                canvas3.height = customResolution;
                ctx.save();
                ctx.drawImage(canvas2, 
                              gridX - lineWW/2, gridY - lineWW/2, 
                              gridSL + lineWW, gridSL + lineWW,
                              0, 0, 
                              customResolution, customResolution);
            } else {
                canvas3.width = (gridSL + lineWW) * downloadResolution;
                canvas3.height = (gridSL + lineWW) * downloadResolution;
                ctx.save();
                ctx.scale(downloadResolution, downloadResolution);
                ctx.drawImage(canvas2, gridX - lineWW/2, gridY - lineWW/2, gridSL + lineWW, gridSL + lineWW, 
                              0, 0, canvas3.width / downloadResolution, canvas3.height / downloadResolution);
            }

            ctx.restore();
            ctx = canvas.getContext('2d');
            
            const link = document.createElement('a');
            link.download = (customFileName || getPuzzleTitle()) + '.png';
            link.href = canvas3.toDataURL();
            link.click();
            
            togglePreview(screenshot);
        }
    }

    if (window.grid) {
        doShim();
    } else {
        document.addEventListener('DOMContentLoaded', (event) => {
            doShim();
        });
    }
})();

