import scour
import os
import re

from scour.scour import (make_well_formed, parse_args, scourString, scourXmlFile, start, run,
                         XML_ENTS_ESCAPE_APOS, XML_ENTS_ESCAPE_QUOT)
from scour.svg_regex import svg_parser

svg_path = 'svg'

non_optimized_svgs = [os.path.join(svg_path, f) for f in os.listdir(
    svg_path) if re.match(r'^((?!opt).)*\.svg', f)]

for orgSvg in non_optimized_svgs:
    optSvg = orgSvg[:-3] + 'opt.svg'
    with open(optSvg, 'w') as outWriter:
        doc = scourXmlFile(orgSvg, parse_args(['--set-precision=3', '--remove-metadata', '--enable-viewboxing',
            '--enable-id-stripping', '--protect-ids-noninkscape', '--strip-xml-prolog',
            '--enable-comment-stripping', '--indent=none', '--create-groups']))        
        doc.writexml(outWriter)

