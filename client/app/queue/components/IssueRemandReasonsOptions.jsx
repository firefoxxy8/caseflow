import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { css } from 'glamor';
import { formatDateStr } from '../../util/DateUtil';
import scrollToComponent from 'react-scroll-to-component';

import Checkbox from '../../components/Checkbox';
import CheckboxGroup from '../../components/CheckboxGroup';
import RadioField from '../../components/RadioField';

import {
  getIssueProgramDescription,
  getIssueTypeDescription
} from '../utils';
import {
  startEditingAppealIssue,
  saveEditedAppealIssue
} from '../QueueActions';
import {
  fullWidth,
  REMAND_REASONS
} from '../constants';

const smallLeftMargin = css({ marginLeft: '1rem' });
const smallBottomMargin = css({ marginBottom: '1rem' });
const flexContainer = css({
  display: 'flex',
  maxWidth: '75rem'
});
const flexColumn = css({
  flexDirection: 'row',
  flexWrap: 'wrap',
  width: '50%'
});

class IssueRemandReasonsOptions extends React.PureComponent {
  constructor(props) {
    super(props);

    const options = _.concat(..._.values(REMAND_REASONS));
    const pairs = _.zip(
      _.map(options, 'id'),
      _.map(options, () => ({
        checked: false,
        after_certification: null
      }))
    );

    this.state = _.fromPairs(pairs);
  }

  updateIssue = (attributes) => {
    const { appealId, issueId } = this.props;

    this.props.startEditingAppealIssue(appealId, issueId, attributes);
    this.props.saveEditedAppealIssue(appealId);
  };

  validateChosenOptions = () => _(this.state).
    map((val) => val.checked && val.after_certification !== null).
    compact().
    value().
    length >= 1;

  componentDidMount = () => {
    const {
      issue: { vacols_sequence_id: issueId },
      issues
    } = this.props;

    _.each(this.props.issue.remand_reasons, (reason) => this.setState({
      [reason.code]: {
        checked: true,
        after_certification: reason.after_certification
      }
    }));

    if (_.map(issues, 'vacols_sequence_id').indexOf(issueId) > 0) {
      scrollToComponent(this, {
        align: 'top',
        duration: 1500,
        ease: 'outCube',
        offset: -35
      });
    }
  };

  componentWillUnmount = () => {
    // on unmount, update issue attrs from state
    // "remand_reasons": [
    //   {"code": "AB", "after_certification": true},
    //   {"code": "AC", "after_certification": false}
    // ]
    const remandReasons = _(this.state).
      map((val, key) => {
        if (!val.checked) {
          return false;
        }

        return {
          code: key,
          ..._.pick(val, 'after_certification')
        };
      }).
      compact().
      value();

    this.updateIssue({ remand_reasons: remandReasons });
  };

  toggleRemandReason = (checked, event) => this.setState({
    [event.target.id.split('-')[1]]: {
      checked,
      after_certification: null
    }
  });

  getCheckbox = (option, onChange, values) => <React.Fragment key={option.id}>
    <Checkbox
      name={`${this.props.issue.vacols_sequence_id}-${option.id}`}
      onChange={onChange}
      value={values[option.id].checked}
      label={option.label}
      unpadded />
    {values[option.id].checked && <RadioField
      id={option.id}
      vertical
      key={`${option.id}-after-certification`}
      styling={css(smallLeftMargin, smallBottomMargin)}
      name={`${this.props.issue.vacols_sequence_id}-${option.id}`}
      hideLabel
      options={[{
        displayText: 'Before certification',
        value: 'false'
      }, {
        displayText: 'After certification',
        value: 'true'
      }]}
      value={this.state[option.id].after_certification}
      onChange={(afterCertification) => this.setState({
        [option.id]: {
          checked: true,
          after_certification: afterCertification
        }
      })}
    />}
  </React.Fragment>;

  render = () => {
    const {
      issue,
      issues,
      idx,
      appeal: { attributes: appeal }
    } = this.props;
    const checkboxGroupProps = {
      onChange: this.toggleRemandReason,
      getCheckbox: this.getCheckbox,
      values: this.state
    };

    return <div key={`remand-reasons-${issue.vacols_sequence_id}`}>
      <h2 className="cf-push-left" {...css(fullWidth, smallBottomMargin)}>
        Issue {idx + 1} {issues.length > 1 ? ` of ${issues.length}` : ''}
      </h2>
      <div {...smallBottomMargin}>Program: {getIssueProgramDescription(issue)}</div>
      <div {...smallBottomMargin}>Issue: {getIssueTypeDescription(issue)}</div>
      <div {...smallBottomMargin}>Code: {_.last(issue.description)}</div>
      <div {...smallBottomMargin}>Certified: {formatDateStr(appeal.certification_date)}</div>

      <div {...flexContainer}>
        <div {...flexColumn}>
          <CheckboxGroup
            label={<h3>Medical examination and opinion</h3>}
            name="med-exam"
            options={REMAND_REASONS.medicalExam}
            {...checkboxGroupProps} />
          <CheckboxGroup
            label={<h3>Duty to assist records request</h3>}
            name="duty-to-assist"
            options={REMAND_REASONS.dutyToAssistRecordsRequest}
            {...checkboxGroupProps} />
        </div>
        <div {...flexColumn}>
          <CheckboxGroup
            label={<h3>Duty to notify</h3>}
            name="duty-to-notify"
            options={REMAND_REASONS.dutyToNotify}
            {...checkboxGroupProps} />
          <CheckboxGroup
            label={<h3>Due process</h3>}
            name="due-process"
            options={REMAND_REASONS.dueProcess}
            {...checkboxGroupProps} />
        </div>
      </div>
    </div>;
  };
}

IssueRemandReasonsOptions.propTypes = {
  appealId: PropTypes.string.isRequired,
  issueId: PropTypes.number.isRequired,
  idx: PropTypes.number.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const appeal = state.queue.pendingChanges.appeals[ownProps.appealId];
  const issues = appeal.attributes.issues;

  return {
    appeal,
    issues: _.filter(issues, (issue) => issue.disposition === 'Remanded'),
    issue: _.find(issues, (issue) => issue.vacols_sequence_id === ownProps.issueId)
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
  startEditingAppealIssue,
  saveEditedAppealIssue
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(IssueRemandReasonsOptions);
