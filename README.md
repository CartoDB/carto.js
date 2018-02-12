# CARTO.js 4.0

CARTO.js is a JavaScript library to create custom location intelligence applications that leverage the power of [CARTO](https://carto.com/). It is the library that powers [Builder](https://carto.com/builder/) and it is part of the [Engine](https://carto.com/pricing/engine/) ecosystem.

## Getting Started

The best way to get started is to navigate through the CARTO.js documentation site:

- [Guide](https://carto.com/documentation/cartojs/guides/quickstart/) will give you a good overview of the library.
- [API Reference](https://carto.com/documentation/cartojs/docs/) will help you use a particular class or method.
- [Examples](https://carto.com/documentation/cartojs/examples/) will demo some specific features.
- [Support](https://carto.com/documentation/cartojs/support/) might answer some of your questions.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/CartoDB/cartodb.js/tags).

## Submitting Contributions

You will need to sign a Contributor License Agreement (CLA) before making a submission. [Learn more here.](https://carto.com/contributions/)

## License

This project is licensed under the BSD 3-clause "New" or "Revised" License - see the [LICENSE.txt](LICENSE.txt) file for details.

## Development

### Install the dependencies

```
yarn
```

### Run the tests

```
yarn test
```

To launch the tests in the browser

```
yarn test:browser
```

### Build the library

```
yarn build
```

To watch the files

```
yarn build:watch
```

### Generate the docs

```
yarn docs
```

### Release version

```
yarn bump
```

To publish a release to the `CDN` and `npm`

```
yarn release
```
