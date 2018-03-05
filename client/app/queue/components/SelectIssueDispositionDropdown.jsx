import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { css } from 'glamor';

import SearchableDropdown from '../../components/SearchableDropdown';

import StringUtil from '../../util/StringUtil';
import { updateAppealIssue } from '../QueueActions';
import Checkbox from '../../components/Checkbox';

// todo: map to VACOLS attrs
const issueDispositionOptions = [
  [1, 'Allowed'],
  [3, 'Remanded'],
  [4, 'Denied'],
  [5, 'Vacated'],
  [6, 'Dismissed, Other'],
  [8, 'Dismissed, Death'],
  [9, 'Withdrawn']
];

class SelectIssueDispositionDropdown extends React.Component {
  styling = ({ disposition }) => {
    const highlight = this.props.highlight && !disposition;

    if (highlight) {
      return css({
        borderLeft: '4px solid #cd2026',
        paddingLeft: '1rem',
        width: '45rem',
        minHeight: '8rem'
      });
    }

    return css({
      minHeight: '12rem'
    });
  };

  render = () => <div {...this.styling(this.props.issue)}>
    <SearchableDropdown
      placeholder="Select Dispositions"
      value={this.props.issue.disposition}
      hideLabel
      searchable={false}
      errorMessage={(this.props.highlight && !this.props.issue.disposition) ? 'This field is required' : ''}
      options={issueDispositionOptions.map((opt) => ({
        label: `${opt[0]} - ${opt[1]}`,
        value: StringUtil.convertToCamelCase(opt[1])
      }))}
      onChange={({ value }) => this.props.updateAppealIssue(
        this.props.vacolsId,
        this.props.issue.id,
        {
          disposition: value,
          duplicate: false
        }
      )}
      name="Dispositions dropdown" />
    {this.props.issue.disposition === 'vacated' && <Checkbox
      name="duplicate-vacated-issue"
      styling={css({
        marginBottom: 0,
        marginTop: '1rem'
      })}
      onChange={(duplicate) => this.props.updateAppealIssue(
        this.props.vacolsId,
        this.props.issue.id,
        { duplicate }
      )}
      label="Automatically create vacated issue for readjudication." />}
  </div>;
}

SelectIssueDispositionDropdown.propTypes = {
  issue: PropTypes.object.isRequired,
  vacolsId: PropTypes.string.isRequired,
  highlight: PropTypes.bool
};

const mapStateToProps = (state) => ({
  highlight: state.queue.ui.highlightFormItems
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  updateAppealIssue
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SelectIssueDispositionDropdown);