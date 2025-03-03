chimps
======

__chimps__ is a spatial-temporal dynamics processor for ambient wireless decodings and companion to [barnacles](https://github.com/reelyactive/barnacles).

![Overview of chimps](https://reelyactive.github.io/chimps/images/overview.png)

__chimps__ ingests a real-time stream of [raddec](https://github.com/reelyactive/raddec) objects and outputs _spatem_ (SPAtial-TEMporal) objects based on positions calculated internally by positioning engines and/or externally by third-party systems.

__chimps__ is a lightweight [Node.js package](https://www.npmjs.com/package/chimps) that can run on resource-constrained edge devices as well as on powerful cloud servers and anything in between. It is typically connected with a [barnowl](https://github.com/reelyactive/barnowl) and/or [barnacles](https://github.com/reelyactive/barnacles) instance which sources real-time radio decodings from an underlying hardware layer. Together these packages are core components of reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware.


Getting Started
---------------

Follow our step-by-step tutorials to get started with __chimps__ bundled within __Pareto Anywhere__:
- [Run Pareto Anywhere on a PC](https://reelyactive.github.io/diy/pareto-anywhere-pc/)
- [Run Pareto Anywhere on a Raspberry Pi](https://reelyactive.github.io/diy/pareto-anywhere-pi/)

Learn "owl" about the __spatem__ JSON data output:
- [reelyActive Developer's Cheatsheet](https://reelyactive.github.io/diy/cheatsheet/)


Quick Start
-----------

Clone this repository, install package dependencies with `npm install`, and then from the root folder run at any time:

    npm start

__chimps__ will listen for raddec UDP packets on 0.0.0.0:50001 and print the spatial-temporal (spatem) data to the console.


spatem
------

The format of the spatem object, which is the sole output of __chimps__, is as follows:

    {
      deviceId: "bada55beac04",
      deviceIdType: 2,
      type: "location", // "position" or "location"
      data: { /* FeatureCollection */ },
      timestamp: 1645568542222
    }

In the case where the position of the associated raddec cannot be matched with any Features in __chimps__' FeatureCollection, the spatem type will be a _position_ and include a FeatureCollection of exactly one item, a "Point", as its data property.  Else, the spatem type will be a _location_ and include a FeatureCollection which adds all matched Features as its data property.  Each type of spatem is described in full detail below.

### position

A spatem of type _position_ has the following format:

    {
      deviceId: "bada55beac04",
      deviceIdType: 2,
      type: "position",
      data: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { isDevicePosition: true, positioningEngine: "External" },
          geometry: {
            type: "Point",
            coordinates: [ 0.0, 0.0, 0.0 ]
          }
        }]
      },
      timestamp: 1645568542222
    }

__chimps__ adds the property `isDevicePosition` to indicate that the "Point" represents the device position, as per the raddec.

### location

A spatem of type _location_ has the following format:

    {
      deviceId: "bada55beac04",
      deviceIdType: 2,
      type: "location",
      data: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { isDevicePosition: true,
                        positioningEngine: "AnchorAndPull" },
          geometry: {
            type: "Point",
            coordinates: [ 0.0, 0.0, 0.0 ]
          }
        },{
          type: "Feature",
          id: "(from chickadee)",
          properties: { name: "" },
          geometry: {
            type: "Polygon",
            coordinates: [[[ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, 0 ], [ 0, 1 ]]]
          }
        }
      ]},
      timestamp: 1645568542222
    }

Note that the first feature in the FeatureCollection will always be the "Point" representing the device position as per the raddec, with __chimps__ adding the property `isDevicePosition` to differentiate from any other associated "Point" which may be present in the FeatureCollection.


Positioning Engines
-------------------

__chimps__ supports both internal and external positioning engines for estimating the real-time position of devices based on radio decodings and metadata.  Positioning engines are configured through the `positioningEngines` option which has the following default setting:

    [
      { inputFilterParameters: {}, engine: PositioningEngines.External },
      { inputFilterParameters: {
            acceptedEvents: [ Raddec.events.APPEARANCE,
                              Raddec.events.DISPLACEMENT,
                              Raddec.events.KEEPALIVE ] },
        engine: PositioningEngines.AnchorAndPull }
    ]

The first positioning engine in the array to meet the inputFilterParameters criteria _and_ return a position will be observed.  In other words, the positioning engines are priority-based and mutually exclusive.

The default setting prioritises external (third-party) positioning engines which add a `position` property to the raddec _before_ it is ingested by __chimps__.  If no `position` property is present, instead the anchor-and-pull engine will provide a position estimate, when possible, upon ingestion of a raddec from [barnacles](https://github.com/reelyactive/barnacles) which corresponds with an appearance, displacement or keepalive event.

A user-defined positioning engine can be specified by providing as the `engine` property a Class which includes an `estimatePosition` function which takes as parameters a `raddec` and `associations`.  For example:

```javascript
engine:
  class AlwaysAtParc {
    constructor(options) {}
    estimatePosition(raddec, associations) {
      return [ -73.57123, 45.50883 ];
    }
  }
```

Be advised that RSSI-based positioning in real-world conditions, _especially with ambient devices and existing infrastructure,_ is inherently limited in accuracy.  The anchor-and-pull method is provided as a low-overhead means to output "good enough" positions for applications which must consume data in the form of coordinates.  If highly-accurate coordinate-based positioning is absolutely required, instead select the appropriate technologies and infrastructure that add a `position` property _before_ it is ingested by __chimps__. 


Options
-------

__chimps__ supports the following options:

| Property               | Default | Description                            | 
|:-----------------------|:--------|:---------------------------------------|
| inputFilterParameters  | {}      | Filter on inbound raddecs (see [raddec-filter](https://github.com/reelyactive/raddec-filter)) |
| observedEvents         | [ 'position', 'location' ] | List of event types that will produce a spatem output |
| maxStoredSpatems       | 1       | The number of historic spatems to maintain in memory per device |
| historyMilliseconds    | 5000    | How long to retain spatem data before it is flushed from memory |
| featureCollection      | {}      | Explicit FeatureCollection to use in the absence of a connected chickadee instance |
| associations           | Map()   | Explicit device associations to use in the absence of a connected chickadee instance |
| positioningEngines     | (see above) | The positioning engines and parameters to use to estimate device positions |
| barnowl                | null    | barnowl instance providing source data |
| barnacles              | null    | barnacles instance providing source data |


![chimps logo](https://reelyactive.github.io/chimps/images/chimps-bubble.png)


What's in a name?
-----------------

Chimpanzees (or __chimps__ for short) exhibit remarkable spatial awareness skills and episodic memory, making them a great (ape) mascot for spatial-temporal dynamics processing.  Specifically, __chimps__ can hold and manipulate spatial information in working memory, allowing them to recall the location of multiple "things" in an environment.  And __chimps__ can learn to use tools, like external positioning engines, and openly share what they've learned with their community.

Interspecies communication between humans and __chimps__ is well known, but you may be surprised to learn that—at least in our mascot universe—__chimps__ and chickadees are BFFs that enjoy communicating thanks to their respective abilities for linguistic adaptation!  To achieve contextual localisation, __chimps__ will kindly ask a [chickadee](https://github.com/reelyactive/chickadee/) to use its outstanding associative memory to recall GeoJSON features, as monkey-value pairs, for use in their spatial reasoning.


Project History
---------------

__chimps__ v1.0.0 was released in October 2022, developed to accommodate 2D and 3D real-time location data, initially from [barnowl-rfcontrols](https://github.com/reelyactive/barnowl-rfcontrols/).


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.


License
-------

MIT License

Copyright (c) 2022-2025 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

