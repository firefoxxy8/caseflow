import { createSelector } from 'reselect';
import { INTAKE_STATES } from './constants';
import _ from 'lodash';

const getIntakeDetailStatus = (intakeDetail) => {
  if (intakeDetail.isComplete) {
    return INTAKE_STATES.COMPLETED;
  } else if (intakeDetail.isReviewed) {
    return INTAKE_STATES.REVIEWED;
  } else if (intakeDetail.isStarted) {
    return INTAKE_STATES.STARTED;
  }

  return null;
};

const getIntakeStatusSelector = ({ rampElection, rampRefiling, supplementalClaim, higherLevelReview }) => ({
  rampElection: _.pick(rampElection, ['isStarted', 'isReviewed', 'isComplete']),
  rampRefiling: _.pick(rampRefiling, ['isStarted', 'isReviewed', 'isComplete']),
  supplementalClaim: _.pick(supplementalClaim, ['isStarted', 'isReviewed', 'isComplete']),
  higherLevelReview: _.pick(higherLevelReview, ['isStarted', 'isReviewed', 'isComplete'])
});

export const getIntakeStatus = createSelector(
  [getIntakeStatusSelector],
  (state) => {
    // Only one intake detail should be started at a time,
    // so find that intake detail's status
    const status = _.reduce(state, (result, intakeDetail) => (
      result || getIntakeDetailStatus(intakeDetail)
    ), null);

    return status || INTAKE_STATES.NONE;
  }
);
