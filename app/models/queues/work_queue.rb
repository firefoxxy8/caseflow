# Called "WorkQueue" instead of "Queue" to not conflict with the
# "Queue" class that ships with Ruby.
class WorkQueue
  include ActiveModel::Model
  class << self
    attr_writer :repository

    def tasks_with_appeals(user, role)
      vacols_tasks = repository.tasks_for_user(user.css_id)
      vacols_appeals = repository.appeals_from_tasks(vacols_tasks)

      tasks = vacols_tasks.map do |task|
        (role + "LegacyTask").constantize.from_vacols(task, user)
      end
      [tasks, vacols_appeals]
    end

    def repository
      return QueueRepository if FeatureToggle.enabled?(:test_facols)
      @repository ||= QueueRepository
    end
  end
end
