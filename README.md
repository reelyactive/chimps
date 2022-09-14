chimps
======

Spatial-temporal dynamics processor for context-aware physical spaces and companion to [barnacles](https://github.com/reelyactive/barnacles).

__chimps__ ingests a real-time stream of [raddec](https://github.com/reelyactive/raddec) objects and outputs _spatem_ (SPAtial-TEMporal) objects whenever position information is included in the former.

__chimps__ is a lightweight [Node.js package](https://www.npmjs.com/package/chimps) that can run on resource-constrained edge devices as well as on powerful cloud servers and anything in between. It is typically connected with a [barnowl](https://github.com/reelyactive/barnowl) instance which sources real-time radio decodings from an underlying hardware layer. Together these packages are core components of [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source software of the [reelyActive technology platform](https://www.reelyactive.com/technology/).


Installation
------------

    npm install chimps


Quick start
-----------

    npm start

__chimps__ will listen for raddec UDP packets on port 50001 and print the spatial-temporal (spatem) data to the console.


Options
-------

__chimps__ supports the following options:

| Property               | Default | Description                            | 
|:-----------------------|:--------|:---------------------------------------|
| inputFilterParameters  | {}      | Filter on inbound raddecs (see [raddec-filter](https://github.com/reelyactive/raddec-filter)) |
| chickadee              | null    | chickadee instance providing a FeatureCollection |
| featureCollection      | {}      | Explicit FeatureCollection to use in the absence of a connected chickadee instance |
| barnowl                | null    | barnowl instance providing source data |


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.

[![Known Vulnerabilities](https://snyk.io/test/github/reelyactive/chimps/badge.svg)](https://snyk.io/test/github/reelyactive/chimps)


License
-------

MIT License

Copyright (c) 2022 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

