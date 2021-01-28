import scour
import os

from scour.scour import (make_well_formed, parse_args, scourString, scourXmlFile, start, run,
                         XML_ENTS_ESCAPE_APOS, XML_ENTS_ESCAPE_QUOT)
from scour.svg_regex import svg_parser

org_svg_path = os.path.join('svg', 'org')
opt_svg_path = 'svg'

org_svgs_files = []
opt_svgs_files = []

for f in os.listdir(org_svg_path):
    if f.endswith(".svg"):
        org_svgs_files.append(os.path.join(org_svg_path, f))
        opt_svgs_files.append(os.path.join(opt_svg_path, f)[:-3] + 'opt.svg') 


for i, orgSvg in enumerate(org_svgs_files):
    optSvg = opt_svgs_files[i]
    with open(optSvg, 'w') as outWriter:
        doc = scourXmlFile(orgSvg, parse_args(['--set-precision=3', '--remove-metadata', '--enable-viewboxing',
            '--enable-id-stripping', '--protect-ids-noninkscape', '--strip-xml-prolog',
            '--enable-comment-stripping', '--indent=none', '--create-groups']))        
        doc.writexml(outWriter)

