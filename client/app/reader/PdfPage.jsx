import React from 'react';
import PropTypes from 'prop-types';

import CommentLayer from './CommentLayer';
import { connect } from 'react-redux';
import _ from 'lodash';
import { setPdfPageDimensions, setIfPdfPageIsDrawn, setIfPdfPageIsDrawing } from '../reader/actions';
import { bindActionCreators } from 'redux';
import { pageNumberOfPageIndex } from './utils';
import { PDFJS } from 'pdfjs-dist/web/pdf_viewer.js';

import classNames from 'classnames';

// This comes from the class .pdfViewer.singlePageView .page in _reviewer.scss.
// We need it defined here to be able to expand/contract margin between pages
// as we zoom.
const PAGE_MARGIN_BOTTOM = 25;

// These both come from _pdf_viewer.css and is the default height
// of the pages in the PDF. We need it defined here to be
// able to expand/contract the height of the pages as we zoom.
const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;

export class PdfPage extends React.Component {
  getPageContainerRef = (pageContainer) => {
    this.pageContainer = pageContainer;
    this.props.getPageContainerRef(this.props.pageIndex, this.props.file, pageContainer);
  }
  getCanvasRef = (canvas) => {
    this.canvas = canvas;
    this.props.getCanvasRef(this.props.pageIndex, this.props.file, canvas);
  }
  getTextLayerRef = (textLayer) => {
    this.textLayer = textLayer;
    this.props.getTextLayerRef(this.props.pageIndex, this.props.file, textLayer);
  }

  // This method is the worst. It is our main interaction with PDFJS, so it will
  // likey remain complicated.
  drawPage = () => {
    if (this.props.isDrawing || this.props.isDrawn) {
      return Promise.reject();
    }

    this.props.setIfPdfPageIsDrawing(this.props.file, this.props.pageIndex, true);

    return this.props.pdfDocument.getPage(pageNumberOfPageIndex(this.props.pageIndex)).then((pdfPage) => {
      // The viewport is a PDFJS concept that combines the size of the
      // PDF pages with the scale go get the dimensions of the divs.
      const viewport = pdfPage.getViewport(this.props.scale);

      // We need to set the width and heights of everything based on
      // the width and height of the viewport.
      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;

      // this.setElementDimensions(this.textLayer, viewport);
      // this.setElementDimensions(this.props.pageContainer, viewport);
      this.textLayer.innerHTML = '';

      // Call PDFJS to actually draw the page.
      return pdfPage.render({
        canvasContext: this.canvas.getContext('2d', { alpha: false }),
        viewport
      }).
      then(() => {
        return Promise.resolve({
          pdfPage,
          viewport
        });
      });
    }).
    then(({ pdfPage, viewport }) => {
      // Get the text from the PDF and write it.
      return pdfPage.getTextContent().then((textContent) => {
        return Promise.resolve({
          textContent,
          viewport
        });
      });
    }).
    then(({ textContent, viewport }) => {
      console.log(this.textLayer);
      PDFJS.renderTextLayer({
        textContent,
        container: this.textLayer,
        viewport,
        textDivs: []
      });
      this.props.setIfPdfPageIsDrawn(this.props.file, this.props.pageIndex, true);
      this.props.setIfPdfPageIsDrawing(this.props.file, this.props.pageIndex, false);
    }).
    catch(() => {
      this.props.setIfPdfPageIsDrawing(this.props.file, this.props.pageIndex, false);
      return Promise.reject();
    });
  }

  getDimensions = () => {
    this.props.pdfDocument.getPage(pageNumberOfPageIndex(this.props.pageIndex)).then((pdfPage) => {
      const PAGE_DIMENSION_SCALE = 1;
      const viewport = pdfPage.getViewport(PAGE_DIMENSION_SCALE);
      const pageDimensions = _.pick(viewport, ['width', 'height']);

      this.props.setPdfPageDimensions(this.props.file, this.props.pageIndex, pageDimensions);
    }).
    catch(() => {
      const pageDimensions = {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT
      };

      this.props.setPdfPageDimensions(this.props.file, this.props.pageIndex, pageDimensions);
    });
  }

  componentDidMount = () => {
    this.getDimensions();
    this.drawPage();
  }

  render() {
    const pageClassNames = classNames({
      'cf-pdf-pdfjs-container': true,
      page: true,
      'cf-pdf-placing-comment': this.props.isPlacingAnnotation
    });
    const currentWidth = _.get(this.props.pageDimensions, ['width'], PAGE_WIDTH);
    const currentHeight = _.get(this.props.pageDimensions, ['height'], PAGE_HEIGHT);

    const divPageStyle = {
      marginBottom: `${PAGE_MARGIN_BOTTOM * this.props.scale}px`,
      width: `${this.props.scale * currentWidth}px`,
      height: `${this.props.scale * currentHeight}px`,
      verticalAlign: 'top',
      display: this.props.isVisible ? '' : 'none'
    };

    const otherComponentStyle = {
      width: `${this.props.scale * currentWidth}px`,
      height: `${this.props.scale * currentHeight}px`
    }

    // Only pages that are the correct scale should be visible
    // const CORRECT_SCALE_DELTA_THRESHOLD = 0.01;
    // const pageContentsVisibleClass = classNames({
    //   'cf-pdf-page-hidden': !(Math.abs(this.props.scale - _.get(this.props.isDrawn,
    //       [this.props.file, this.props.pageIndex, 'scale'])) < CORRECT_SCALE_DELTA_THRESHOLD)
    // });

    return <div
      id={`pageContainer${pageNumberOfPageIndex(this.props.pageIndex)}`}
      className={pageClassNames}
      style={divPageStyle}
      ref={this.getPageContainerRef}>
        <div>
          <canvas
            ref={this.getCanvasRef}
            style={otherComponentStyle}
            className="canvasWrapper" />
          <div className="cf-pdf-annotationLayer">
            {this.props.isVisible && <CommentLayer
              documentId={this.props.documentId}
              pageIndex={this.props.pageIndex}
              scale={this.props.scale}
            />}
          </div>
          <div
            ref={this.getTextLayerRef}
            style={otherComponentStyle}
            className="textLayer"/>
        </div>
      </div>;
  }
}

PdfPage.propTypes = {
  documentId: PropTypes.number,
  file: PropTypes.string,
  pageIndex: PropTypes.number,
  isVisible: PropTypes.bool,
  scale: PropTypes.number,
  isDrawn: PropTypes.object,
  getPageContainerRef: PropTypes.func,
  getCanvasRef: PropTypes.func,
  getTextLayerRef: PropTypes.func,
  pdfDocument: PropTypes.object
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({
    setPdfPageDimensions,
    setIfPdfPageIsDrawn,
    setIfPdfPageIsDrawing
  }, dispatch)
});

const mapStateToProps = (state, props) => {
  const page = _.get(state.readerReducer, ['documentsByFile', props.file, 'pages', props.pageIndex], {});

  return {
    pageDimensions: _.pick(page, ['width', 'height']),
    isDrawn: page.isDrawn,
    isDrawing: page.isDrawing,
    isPlacingAnnotation: state.readerReducer.ui.pdf.isPlacingAnnotation
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(PdfPage);
