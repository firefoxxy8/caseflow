describe Intake do
  before do
    Timecop.freeze(Time.utc(2015, 1, 1, 12, 0, 0))
  end

  class TestIntake < Intake; end
  class AnotherTestIntake < Intake; end

  let(:veteran_file_number) { "64205050" }

  let(:detail) do
    RampElection.new(veteran_file_number: veteran_file_number, notice_date: Time.zone.now)
  end

  let(:user) { Generators::User.build }
  let(:another_user) { Generators::User.build(full_name: "David Schwimmer") }

  let(:intake) do
    TestIntake.new(
      veteran_file_number: veteran_file_number,
      detail: detail,
      user: user,
      started_at: 15.minutes.ago,
      completion_status: completion_status,
      completion_started_at: completion_started_at
    )
  end

  let!(:veteran) { Generators::Veteran.build(file_number: "64205050") }

  let(:completion_status) { nil }
  let(:completion_started_at) { nil }

  context ".build" do
    subject { Intake.build(form_type: form_type, veteran_file_number: veteran_file_number, user: user) }

    context "when form_type is supported" do
      let(:form_type) { "ramp_election" }

      it { is_expected.to be_a(RampElectionIntake) }
      it { is_expected.to have_attributes(veteran_file_number: veteran_file_number, user: user) }
    end

    context "when form_type is not supported" do
      let(:form_type) { "not_a_real_form" }

      it "raises error" do
        expect { subject }.to raise_error(Intake::FormTypeNotSupported)
      end
    end
  end

  context ".in_progress" do
    subject { Intake.in_progress }

    let!(:started_intake) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        started_at: 15.minutes.ago
      )
    end

    let!(:completed_intake) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        started_at: 10.minutes.ago,
        completed_at: 5.minutes.ago,
        completion_status: "success"
      )
    end

    it "returns in progress intakes" do
      expect(subject).to include(started_intake)
      expect(subject).to_not include(completed_intake)
    end
  end

  context ".flagged_for_manager_review" do
    subject { Intake.flagged_for_manager_review }

    let!(:completed_intake) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        started_at: 10.minutes.ago,
        completed_at: 5.minutes.ago
      )
    end

    let!(:canceled_intake) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        started_at: 10.minutes.ago,
        completed_at: 5.minutes.ago,
        completion_status: :canceled,
        cancel_reason: :duplicate_ep
      )
    end

    let!(:intake_not_accessible) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        started_at: 10.minutes.ago,
        completed_at: 5.minutes.ago,
        completion_status: :error,
        error_code: :veteran_not_accessible
      )
    end

    let!(:intake_not_valid) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        started_at: 10.minutes.ago,
        completed_at: 5.minutes.ago,
        completion_status: :error,
        error_code: :veteran_not_valid
      )
    end

    let!(:intake_invalid_file_number) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        completed_at: 5.minutes.ago,
        completion_status: :error,
        error_code: :veteran_invalid_file_number
      )
    end

    let!(:intake_refiling_already_processed) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        completed_at: 5.minutes.ago,
        completion_status: :error,
        error_code: :ramp_refiling_already_processed
      )
    end

    let!(:completed_intake) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        started_at: 10.minutes.ago,
        completed_at: 5.minutes.ago
      )
    end

    let!(:intake_fixed_later) do
      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        started_at: 10.minutes.ago,
        completed_at: 5.minutes.ago,
        completion_status: :canceled,
        cancel_reason: :duplicate_ep
      )

      Intake.create!(
        veteran_file_number: veteran_file_number,
        detail: detail,
        user: user,
        started_at: 3.minutes.ago,
        completed_at: 2.minutes.ago,
        completion_status: :success
      )
    end

    let(:another_detail) do
      RampElection.new(veteran_file_number: "54321", notice_date: Time.zone.now, established_at: Time.zone.now)
    end

    let!(:intake_with_manual_election) do
      Intake.create!(
        veteran_file_number: "54321",
        detail: another_detail,
        user: user,
        started_at: 10.minutes.ago,
        completed_at: 5.minutes.ago,
        completion_status: :canceled,
        cancel_reason: :other,
        cancel_other: "I get established manually"
      )
    end

    it "returns included intakes (canceled, actionable errors that have yet been resolved)" do
      expect(subject).to_not include(completed_intake)
      expect(subject).to include(canceled_intake)
      expect(subject).to include(
        intake_not_accessible,
        intake_not_valid
      )
      expect(subject).to_not include(
        intake_invalid_file_number,
        intake_refiling_already_processed
      )
      expect(subject).to_not include(intake_fixed_later)
      expect(subject).to_not include(intake_with_manual_election)
    end
  end

  context "#complete_with_status!" do
    it "saves intake with proper tagging" do
      intake.complete_with_status!(:canceled)
      intake.reload

      expect(intake.completed_at).to eq(Time.zone.now)
      expect(intake).to be_canceled
    end
  end

  context "#validate_start" do
    subject { intake.validate_start }

    context "veteran_file_number is null" do
      let(:veteran_file_number) { nil }

      it "adds invalid_file_number and returns false" do
        expect(subject).to eq(false)
        expect(intake.error_code).to eq("invalid_file_number")
      end
    end

    context "veteran_file_number has fewer than 8 digits" do
      let(:veteran_file_number) { "1234567" }

      it "adds invalid_file_number and returns false" do
        expect(subject).to eq(false)
        expect(intake.error_code).to eq("invalid_file_number")
      end
    end

    context "veteran_file_number has more than 9 digits" do
      let(:veteran_file_number) { "1234567899" }

      it "adds invalid_file_number and returns false" do
        expect(subject).to eq(false)
        expect(intake.error_code).to eq("invalid_file_number")
      end
    end

    context "veteran_file_number has non-digit characters" do
      let(:veteran_file_number) { "HAXHAXHAX" }

      it "adds invalid_file_number and returns false" do
        expect(subject).to eq(false)
        expect(intake.error_code).to eq("invalid_file_number")
      end
    end

    context "veteran_file_number is VACOLS style" do
      let(:veteran_file_number) { "12341234C" }

      it "adds invalid_file_number and returns false" do
        expect(subject).to eq(false)
        expect(intake.error_code).to eq("invalid_file_number")
      end
    end

    context "veteran not found in bgs" do
      let(:veteran_file_number) { "11111111" }

      it "adds veteran_not_found and returns false" do
        expect(subject).to eq(false)
        expect(intake.error_code).to eq("veteran_not_found")
      end
    end

    context "veteran not accessible by user" do
      before do
        Fakes::BGSService.inaccessible_appeal_vbms_ids = [veteran_file_number]
      end

      it "adds veteran_not_accessible and returns false" do
        expect(subject).to eq(false)
        expect(intake.error_code).to eq("veteran_not_accessible")
      end
    end

    context "duplicate in progress intake already exists" do
      let!(:other_intake) do
        TestIntake.create!(
          veteran_file_number: veteran_file_number,
          user: another_user,
          started_at: 15.minutes.ago
        )
      end

      it "adds veteran_not_accessible and returns false" do
        expect(subject).to eq(false)
        expect(intake.error_code).to eq("duplicate_intake_in_progress")
        expect(intake.error_data).to eq(processed_by: "David Schwimmer")
      end
    end

    context "duplicate intake exists, but isn't in progress" do
      let!(:other_intake) do
        TestIntake.create!(
          veteran_file_number: veteran_file_number,
          user: another_user,
          started_at: 15.minutes.ago,
          completed_at: 10.minutes.ago
        )
      end

      it { is_expected.to be_truthy }
    end

    context "in progress intake exists on same file number, but not same type" do
      let!(:other_intake) do
        AnotherTestIntake.create!(
          veteran_file_number: veteran_file_number,
          user: another_user,
          started_at: 15.minutes.ago
        )
      end

      it { is_expected.to be_truthy }
    end

    context "in progress intake exists on same type, but not same file number" do
      let!(:other_intake) do
        TestIntake.create!(
          veteran_file_number: "22226666",
          user: another_user,
          started_at: 15.minutes.ago
        )
      end

      it { is_expected.to be_truthy }
    end

    context "when number is valid (even with extra spaces)" do
      let(:veteran_file_number) { "  64205050  " }
      it { is_expected.to be_truthy }
    end
  end

  context "#start_completion!" do
    subject { intake.start_completion! }

    it "sets completion_started_at to now" do
      subject
      expect(intake.completion_started_at).to eq(Time.zone.now)
    end
  end

  context "#abort_completion!" do
    subject { intake.abort_completion! }

    it "undoes whatever start_completion! does" do
      intake.save!
      attributes = intake.attributes

      intake.start_completion!
      expect(intake.attributes).not_to eql(attributes)

      subject
      expect(intake.attributes).to eql(attributes)
    end
  end

  context "#pending?" do
    subject { intake.pending? }
    let(:completion_status) { "pending" }

    context "when completion_started_at is nil" do
      it { is_expected.to be false }
    end

    context "when completion_start_at is not nil and within timeout" do
      let(:completion_started_at) { 4.minutes.ago }

      it { is_expected.to be true }
    end

    context "when completion_start_at is not nil and exceeded timeout" do
      let(:completion_started_at) { 6.minutes.ago }

      it { is_expected.to be false }
    end
  end
end
