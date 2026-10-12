"""Compose the event hero from exact logo paths and anchored vector lighting.

The logo and every adjoining plane share one coordinate system. Do not position
the logo separately in CSS: resize the complete hero-composition instead.
Run from any directory with Python's standard library; no generated imagery.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
NS = {'s': 'http://www.w3.org/2000/svg'}
source = ET.parse(ROOT / 'public/assets/logo.svg').getroot()
colored = source.find("s:g[@id='g108']", NS)
assert colored is not None

definitions = '''
<linearGradient id="sfn-deep" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#081321"/><stop offset=".55" stop-color="#0c2548"/><stop offset="1" stop-color="#205db0"/></linearGradient>
<radialGradient id="sfn-sky" gradientUnits="userSpaceOnUse" cx="1080" cy="350" r="920"><stop stop-color="#52e8ff"/><stop offset=".14" stop-color="#0bb9f3"/><stop offset=".43" stop-color="#126aca"/><stop offset="1" stop-color="#102c63"/></radialGradient>
<linearGradient id="sfn-ray" gradientUnits="userSpaceOnUse" x1="1075" y1="537" x2="1510" y2="980"><stop stop-color="#88f1ff"/><stop offset=".08" stop-color="#22c7f6"/><stop offset=".55" stop-color="#058bd8"/><stop offset="1" stop-color="#14386e"/></linearGradient>
<linearGradient id="sfn-low" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#081321"/><stop offset=".7" stop-color="#10366c"/><stop offset="1" stop-color="#267bd1"/></linearGradient>
<linearGradient id="sfn-rim" x1=".05" y1=".1" x2=".95" y2=".9"><stop stop-color="#3874d0"/><stop offset=".32" stop-color="#81baff"/><stop offset=".53" stop-color="#2a7ade"/><stop offset=".76" stop-color="#7deaff"/><stop offset="1" stop-color="#09a5ed"/></linearGradient>
<linearGradient id="sfn-light" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#86c5ff"/><stop offset=".45" stop-color="#3f8ae1"/><stop offset="1" stop-color="#1552a1"/></linearGradient>
<linearGradient id="sfn-light-reverse" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#96e9ff"/><stop offset=".48" stop-color="#418cdf"/><stop offset="1" stop-color="#143c81"/></linearGradient>
<linearGradient id="sfn-dark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#020d1e"/><stop offset=".56" stop-color="#0a3264"/><stop offset="1" stop-color="#2068b6"/></linearGradient>
<linearGradient id="sfn-edge" gradientUnits="userSpaceOnUse" x1="920" y1="260" x2="1200" y2="700"><stop stop-color="#4b9df3" stop-opacity=".3"/><stop offset=".65" stop-color="#a5f6ff"/><stop offset="1" stop-color="#11a4f1" stop-opacity="0"/></linearGradient>
<linearGradient id="sfn-sheen"><stop stop-color="#9af3ff" stop-opacity="0"/><stop offset=".46" stop-color="#c9f9ff" stop-opacity=".08"/><stop offset=".5" stop-color="#e6fcff" stop-opacity=".6"/><stop offset=".58" stop-color="#84eaff" stop-opacity=".12"/><stop offset="1" stop-color="#84eaff" stop-opacity="0"/></linearGradient>
<clipPath id="sfn-unfold" clipPathUnits="userSpaceOnUse"><path class="scene-aperture" d="M920 260 1080 352.376V537.128L920 629.504 760 537.128V352.376Z" transform="translate(-17480 -8445) scale(20)"/></clipPath>
'''

# These six shared vertices describe the original mark at x=760, y=260,
# scale=.32, retaining its original 1000 x 1154.7 proportions.
planes = '''
<path fill="url(#sfn-deep)" d="M920 260 920 -1200 -500 -1200 760 352.376Z"/>
<path fill="#123467" d="M920 -1200 920 260 760 352.376 792 284Z"/>
<path fill="url(#sfn-sky)" d="M920 260 3200 -667V3000L1080 537.128Z"/>
<path fill="url(#sfn-low)" d="M760 537.128 920 629.504 180 3000H-1900Z"/>
<path fill="url(#sfn-deep)" d="M920 629.504 1080 537.128 1950 3000H1250Z"/>
<path fill="url(#sfn-ray)" d="M1080 537.128 3200 2460 2370 3000 920 629.504Z"/>
<path fill="none" stroke="url(#sfn-edge)" stroke-width="1.3" d="M920 -1200V260L3200 -667M1080 537.128 3200 2460M920 629.504 2370 3000"/>
<path fill="#07182d" d="M920 260 1080 352.376V537.128L920 629.504 760 537.128V352.376Z"/>
'''
paths = []
for node in colored.findall('s:path', NS):
    ident = node.get('id')
    gradient = ('sfn-rim' if ident == 'path8' else
                'sfn-dark' if int(ident[4:]) <= 7 else
                'sfn-light-reverse' if ident in {'path10', 'path12', 'path14'} else 'sfn-light')
    transform = f' transform="{escape(node.get("transform"), quote=True)}"' if node.get('transform') else ''
    # d and transform are copied verbatim from the original, never approximated.
    paths.append(f'<path data-source-path="{ident}" d="{escape(node.get("d"), quote=True)}"{transform} fill="url(#{gradient})"/>')
mark = f'<g class="scene-mark" transform="translate(760 260) scale(.32)"><g transform="{colored.get("transform")}">' + ''.join(paths) + '</g></g>'
# Reuse exact source paths for the light's clipping boundary; no new logo geometry.
# A clipPath takes shapes directly. Flatten the transform stack, not the paths;
# grouping these shapes inside <g> produces an empty clip in Chromium.
clip_paths = ''.join(f'<path d="{escape(node.get("d"), quote=True)}" fill="white" '
                     f'transform="translate(760 260) scale(.32) {colored.get("transform")} '
                     f'{escape(node.get("transform", ""), quote=True)}"/>'
                     for node in colored.findall('s:path', NS))
definitions += f'<clipPath id="sfn-mark-clip">{clip_paths}</clipPath>'
light = '''
<g clip-path="url(#sfn-mark-clip)"><path class="scene-sheen" opacity="0" fill="url(#sfn-sheen)" d="M600 180H800L1240 720H1040Z"/></g>
<g class="scene-traces" fill="none" stroke="#b0f4ff" stroke-width="1.5" opacity="0">
  <path class="scene-outline" pathLength="1" d="M920 260 1080 352.376V537.128L920 629.504 760 537.128V352.376Z"/>
  <path class="scene-signal" pathLength="1" d="M1080 537.128 1850 1235"/>
  <path class="scene-signal scene-signal-top" pathLength="1" d="M920 260 1780 -90"/>
</g>'''
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" class="hero-scene" width="1440" height="855" viewBox="0 0 1440 855" aria-hidden="true" focusable="false">
<defs>{definitions}</defs>
<g class="scene-planes" clip-path="url(#sfn-unfold)">{planes}</g>{mark}{light}
</svg>'''
(ROOT / 'public/assets/events/sfn-2026/hero-scene.svg').write_text(svg + '\n')
entry = ROOT / 'public/events/neuroscience-2026/index.html'
html = entry.read_text()
html, count = re.subn(r'<!-- SFN_SCENE_START -->.*?<!-- SFN_SCENE_END -->',
                     '<!-- SFN_SCENE_START -->\n' + svg + '\n<!-- SFN_SCENE_END -->', html, flags=re.S)
assert count == 1, 'Expected one inline scene slot'
entry.write_text(html)
print('Composed anchored scene, reveal mask and light clipping from all 14 original colored logo paths.')
