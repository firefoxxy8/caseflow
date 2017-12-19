import * as Constants from './actionTypes';
import _ from 'lodash';
import { update } from '../../util/ReducerUtil';
import { START_PLACING_ANNOTATION } from '../AnnotationLayer/actionTypes';

const initialPdfSidebarErrorState = {
  tag: { visible: false,
    message: null },
  category: { visible: false,
    message: null },
  annotation: { visible: false,
    message: null }
};

export const initialState = {
  loadedAppealId: null,
  loadedAppeal: {},
  openedAccordionSections: [
    'Categories', 'Issue tags', Constants.COMMENT_ACCORDION_KEY
  ],
  tagOptions: [],
  hidePdfSidebar: false,
  jumpToPageNumber: null,
  scrollTop: 0,
  hideSearchBar: true,
  pdfSideBarError: initialPdfSidebarErrorState,
  didLoadAppealFail: false
};

const setErrorMessageState = (state, errorType, isVisible, errorMsg = null) =>
  update(state, {
    pdfSideBarError: {
      [errorType]: {
        visible: { $set: isVisible },
        message: { $set: isVisible ? errorMsg : null }
      }
    }
  });

const hideErrorMessage = (state, errorType, errorMsg = null) => setErrorMessageState(state, errorType, false, errorMsg);
const showErrorMessage = (state, errorType, errorMsg = null) => setErrorMessageState(state, errorType, true, errorMsg);

export const pdfViewerReducer = (state = initialState, action = {}) => {
  let allTags;
  let uniqueTags;

  switch (action.type) {
  case Constants.RECEIVE_APPEAL_DETAILS:
    return update(state,
      {
        loadedAppeal: {
          $set: action.payload.appeal
        }
      }
    );
  case Constants.RECEIVE_APPEAL_DETAILS_FAILURE:
    return update(state,
      {
        didLoadAppealFail: {
          $set: action.payload.failedToLoad
        }
      }
    );
  case Constants.SET_LOADED_APPEAL_ID:
    return update(state, {
      loadedAppealId: {
        $set: action.payload.vacolsId
      }
    });

  case Constants.SET_OPENED_ACCORDION_SECTIONS:
    return update(state, {
      openedAccordionSections: {
        $set: action.payload.openedAccordionSections
      }
    });
  case Constants.COLLECT_ALL_TAGS_FOR_OPTIONS:
    allTags = Array.prototype.concat.apply([], _(action.payload).
      map((doc) => {
        return doc.tags ? doc.tags : [];
      }).
      value());
    uniqueTags = _.uniqWith(allTags, _.isEqual);

    return update(state, {
      tagOptions: {
        $set: uniqueTags
      }
    });
  case Constants.TOGGLE_PDF_SIDEBAR:
    return update(state, {
      hidePdfSidebar: { $set: !state.hidePdfSidebar } }
    );
  case Constants.SET_DOC_SCROLL_POSITION:
    return update(state, {
      scrollTop: { $set: action.payload.scrollTop }
    });
  case START_PLACING_ANNOTATION:
    return update(state, {
      openedAccordionSections: {
        $apply: (sectionKeys) => _.union(sectionKeys, [Constants.COMMENT_ACCORDION_KEY])
      }
    });

  // hide search bar
  case Constants.TOGGLE_SEARCH_BAR:
    return update(state, {
      hideSearchBar: { $set: !state.hideSearchBar }
    });
  case Constants.SHOW_SEARCH_BAR:
    return update(state, {
      hideSearchBar: { $set: false }
    });
  case Constants.HIDE_SEARCH_BAR:
    return update(state, {
      hideSearchBar: { $set: true }
    });

  // Jump to page
  case Constants.JUMP_TO_PAGE:
    return update(state, {
      $merge: {
        jumpToPageNumber: action.payload.pageNumber
      }
    });
  case Constants.RESET_JUMP_TO_PAGE:
    return update(state, {
      $merge: {
        jumpToPageNumber: null
      }
    });
  case Constants.SCROLL_TO_SIDEBAR_COMMENT:
    return update(state, {
      ui: {
        pdf: {
          scrollToSidebarComment: { $set: action.payload.scrollToSidebarComment }
        }
      }
    });

  // errors
  case Constants.RESET_PDF_SIDEBAR_ERRORS:
    return update(state, {
      pdfSideBarError: { $set: initialPdfSidebarErrorState }
    });
  case Constants.HIDE_ERROR_MESSAGE:
    return hideErrorMessage(state, action.payload.messageType);
  case Constants.SHOW_ERROR_MESSAGE:
    return showErrorMessage(state, action.payload.messageType, action.payload.errorMessage);
  default:
    return state;
  }
};

export default pdfViewerReducer;
