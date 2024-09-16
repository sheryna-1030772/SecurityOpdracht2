from flask import jsonify, request
from backend.sqlite_models import (Courses, Domains, ChosenDomain, Instances, Modules, Activities, UserProgress,
                                   PointChallenge, UserModule, UserConceptChallenge, UserCoreAssignment,
                                   ConceptChallenge, CoreAssignment)
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging

logging.basicConfig(level=logging.DEBUG)

chosen_domain = ChosenDomain()
point_challenge_model = PointChallenge()
user_module_model = UserModule()
user_concept_challenge_model = UserConceptChallenge()
user_core_assignment_model = UserCoreAssignment()
core_assignment_model = CoreAssignment()
courses_model = Courses()


def row_to_dict(row):
    return {key: row[key] for key in row.keys()}


@jwt_required()
def courses_dashboard(domain_id):
    courses_model = Courses()
    courses = courses_model.get_courses(domain_id)

    courses_json = []
    for course in courses:
        course_dict = {
            'id': course['id'],
            'course_name': course['course_name'],
            'description': course['description']
        }
        courses_json.append(course_dict)

    return jsonify(courses_json)


@jwt_required()
def domains_dashboard():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID not found in token"}), 401

    domains_model = Domains()
    domains = domains_model.get_domains()

    domains_json = []
    for domain in domains:
        domain_dict = {
            'id': domain['id'],
            'domain_name': domain['domain_name']
        }
        domains_json.append(domain_dict)

    return jsonify(domains_json)


@jwt_required()
def get_chosen_domain():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')

    if not user_id:
        logging.error("User ID not found in token")
        return jsonify({"error": "User ID not found in token"}), 401

    logging.debug(f"Fetching chosen domain for user_id: {user_id}")
    domain_id_row = chosen_domain.get_chosen(user_id)

    if not domain_id_row:
        logging.error("Chosen Domain not found for user_id: %s", user_id)
        return jsonify({"error": "Chosen Domain not found"}), 404

    domain_id = domain_id_row['domain_id']

    if not domain_id:
        logging.error("Domain ID not found in chosen domain for user_id: %s", user_id)
        return jsonify({"error": "Domain ID not found in chosen domain"}), 404

    logging.debug(f"Fetching domain name for domain_id: {domain_id}")
    domain_name_row = courses_model.get_domain_name(domain_id)

    if not domain_name_row:
        logging.error("Domain Name not found for domain_id: %s", domain_id)
        return jsonify({"error": "Domain Name not found"}), 404

    domain_name = domain_name_row['domain_name']

    if domain_name:
        logging.debug(f"Domain name found: {domain_name}")
        return jsonify({"domain_name": domain_name}), 200
    else:
        logging.error("Domain Name not found for domain_id: %s", domain_id)
        return jsonify({"error": "Domain Name not found"}), 404


@jwt_required()
def instances_dashboard(course_id):
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')

    instance_model = Instances()
    instances = instance_model.get_instances(course_id)

    instances_json = []
    for instance in instances:
        instance_dict = {
            'id': instance['id'],
            'course_id': instance['course_id'],
            'year': instance['year'],
            'period': instance['period']
        }
        instances_json.append(instance_dict)

    return jsonify(instances_json)


@jwt_required()
def modules_dash(instances_id):
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')

    modules_model = Modules()
    modules = modules_model.get_modules(instances_id)

    user_module_model = UserModule()

    if modules:
        first_module_id = modules[0]['id']
        if not user_module_model.is_module_unlocked(user_id, first_module_id):
            user_module_model.unlock_module(user_id, first_module_id)

    modules_json = []
    for module in modules:
        is_unlocked = user_module_model.is_module_unlocked(user_id, module['id'])
        module_dict = {
            'id': module['id'],
            'instance_id': module['instance_id'],
            'description': module['description'],
            'module_name': module['module_name'],
            'is_unlocked': is_unlocked
        }
        modules_json.append(module_dict)

    return jsonify(modules_json)


@jwt_required()
def activities_dashboard():
    try:
        module_id = request.args.get('module_id')
        current_user = get_jwt_identity()
        user_id = current_user.get('user_id')

        if not module_id:
            return jsonify({"error": "Module ID is required"}), 400

        activity_model = Activities()
        activities = activity_model.get_activities(module_id)

        user_progress_model = UserProgress()
        activities_json = []
        for activity in activities:
            progress = user_progress_model.get_progress(user_id, activity['id'])
            status = 'not_started'
            if progress:
                if progress['status_id'] == 1 or progress['status_id'] is None:
                    status = 'not_started'
                elif progress['status_id'] == 2:
                    status = 'started'
                elif progress['status_id'] == 3:
                    status = 'completed'
                elif progress['status_id'] == 4:
                    status = 'not_completed'
                elif progress['status_id'] == 5:
                    status = 'submitted'
            activity_dict = {
                'id': activity['id'],
                'module_id': activity['module_id'],
                'level': activity['level'],
                'activity_name': activity['activity_name'],
                'group_name': activity['group_name'],
                'status': status
            }
            activities_json.append(activity_dict)

        module_model = Modules()
        module_info = row_to_dict(module_model.get_module(module_id))

        core_assignment_model = CoreAssignment()
        concept_challenge_model = ConceptChallenge()

        core_assignment = core_assignment_model.get_assignments(module_id)
        concept_challenge = concept_challenge_model.get_challenges(module_id)

        total_points = point_challenge_model.get_total_points(user_id, module_id)

        concept_challenge_unlocked = total_points >= 100
        core_assignment_unlocked = total_points >= 200

        return jsonify({
            'module': module_info,
            'activities': activities_json,
            'core_assignment': [row_to_dict(ca) for ca in core_assignment],
            'concept_challenge': [row_to_dict(cc) for cc in concept_challenge],
            'total_points': total_points,
            'is_concept_challenge_completed': user_concept_challenge_model.is_concept_challenge_completed(user_id, module_id),
            'is_core_assignment_completed': user_core_assignment_model.is_core_assignment_completed(user_id, module_id),
            'concept_challenge_unlocked': concept_challenge_unlocked,
            'core_assignment_unlocked': core_assignment_unlocked
        })
    except Exception as e:
        logging.error("Error in activities_dashboard: %s", e)
        return jsonify({"error": "Internal Server Error"}), 500


def get_domains():
    domains_model = Domains()
    domains = domains_model.get_domains()

    domains_json = []
    for domain in domains:
        domain_dict = {
            'id': domain['id'],
            'domain_name': domain['domain_name']
        }
        domains_json.append(domain_dict)

    print(domains_json)

    return jsonify(domains_json)


@jwt_required()
def start_activity():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID not found in token"}), 401

    activity_id = request.json.get('activity_id')
    if not activity_id:
        return jsonify({"error": "Activity ID is required"}), 400

    user_progress_model = UserProgress()
    user_progress_model.start_activity(user_id, activity_id)

    return jsonify({"message": "Activity started"}), 200


@jwt_required()
def complete_activity():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    activity_id = request.json.get('activity_id')
    module_id = request.json.get('module_id')
    level = request.json.get('level')

    if not user_id or not activity_id or not module_id:
        return jsonify({"error": "User ID, Activity ID, and Module ID are required"}), 400

    user_progress_model = UserProgress()
    user_progress_model.complete_activity(user_id, activity_id)

    points_awarded = 0
    if level == 1:
        points_awarded = 5
    elif level == 2:
        points_awarded = 10
    elif level == 3:
        points_awarded = 15
    elif level == 4:
        points_awarded = 20

    point_challenge_model.award_points(user_id, module_id, activity_id, points_awarded)

    total_points = point_challenge_model.get_total_points(user_id, module_id)

    point_challenge_completed = False
    if total_points >= 50 and not point_challenge_model.is_point_challenge_completed(user_id, module_id):
        point_challenge_model.complete_point_challenge(user_id, module_id)
        total_points = point_challenge_model.get_total_points(user_id, module_id)
        point_challenge_completed = True

    user_completed_activities = user_progress_model.get_user_completed_activities(user_id, module_id)

    group_activities_count = {}
    for activity in user_completed_activities:
        group_name = activity['group_name']
        if group_name not in group_activities_count:
            group_activities_count[group_name] = 0
        group_activities_count[group_name] += 1

    all_groups_completed = all(count > 0 for count in group_activities_count.values())

    next_module_unlocked = False
    if total_points >= 50 and all_groups_completed:
        next_module_id = module_id + 1
        user_module_model.unlock_module(user_id, next_module_id)
        next_module_unlocked = True

    concept_challenge_unlocked = user_concept_challenge_model.is_concept_challenge_completed(user_id, module_id)
    core_assignment_unlocked = user_core_assignment_model.is_core_assignment_completed(user_id, module_id)

    return jsonify({
        "message": "Activity completed, points awarded",
        "total_points": total_points,
        "next_module_unlocked": next_module_unlocked,
        "concept_challenge_unlocked": concept_challenge_unlocked,
        "core_assignment_unlocked": core_assignment_unlocked,
        "point_challenge_completed": point_challenge_completed
    }), 200


@jwt_required()
def complete_concept_challenge():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    module_id = request.json.get('module_id')

    if not user_id or not module_id:
        return jsonify({"error": "User ID and Module ID are required"}), 400

    if user_concept_challenge_model.is_concept_challenge_completed(user_id, module_id):
        return jsonify({"error": "Concept Challenge already completed"}), 400

    user_concept_challenge_model.complete_concept_challenge(user_id, module_id)
    point_challenge_model.award_points(user_id, module_id, None, 100)
    total_points = point_challenge_model.get_total_points(user_id, module_id)

    return jsonify({
        "message": "Concept Challenge completed, 100 points awarded",
        "total_points": total_points
    }), 200


@jwt_required()
def complete_core_assignment():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    module_id = request.json.get('module_id')

    if not user_id or not module_id:
        return jsonify({"error": "User ID and Module ID are required"}), 400

    if user_core_assignment_model.is_core_assignment_completed(user_id, module_id):
        return jsonify({"error": "Core Assignment already completed"}), 400

    user_core_assignment_model.complete_core_assignment(user_id, module_id)
    point_challenge_model.set_total_points(user_id, module_id, 300)

    user_progress_model = UserProgress()
    remaining_activities_count = user_progress_model.get_remaining_activities(user_id, module_id)
    notification_message = ""
    if remaining_activities_count > 0:
        notification_message = f"Module voltooid! Je kunt nog {remaining_activities_count} activiteiten voltooien."
    else:
        notification_message = "Module voltooid! Je hebt alle activiteiten voltooid."

    return jsonify({
        "message": "Kernopdracht voltooid, totale punten ingesteld op 300",
        "total_points": 300,
        "notification_message": notification_message
    }), 200


@jwt_required()
def approve_concept_challenge():
    current_user = get_jwt_identity()
    user_id = request.json.get('user_id')
    module_id = request.json.get('module_id')

    if not user_id or not module_id:
        return jsonify({"error": "User ID and Module ID are required"}), 400

    user_core_assignment_model.complete_core_assignment(user_id, module_id)
    return jsonify({"message": "Core Assignment unlocked"}), 200


@jwt_required()
def complete_core_assignment():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    module_id = request.json.get('module_id')

    if not user_id or not module_id:
        return jsonify({"error": "User ID and Module ID are required"}), 400

    user_core_assignment_model.complete_core_assignment(user_id, module_id)

    return jsonify({"message": "Core Assignment completed"}), 200


@jwt_required()
def get_module_status():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    module_id = request.args.get('module_id')

    if not user_id or not module_id:
        return jsonify({"error": "User ID and Module ID are required"}), 400

    is_unlocked = user_module_model.is_module_unlocked(user_id, module_id)
    is_concept_challenge_completed = user_concept_challenge_model.is_concept_challenge_completed(user_id, module_id)
    is_core_assignment_completed = user_core_assignment_model.is_core_assignment_completed(user_id, module_id)

    return jsonify({
        "is_unlocked": is_unlocked,
        "is_concept_challenge_completed": is_concept_challenge_completed,
        "is_core_assignment_completed": is_core_assignment_completed
    }), 200


@jwt_required()
def get_total_points():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    module_id = request.args.get('module_id')

    if not module_id:
        return jsonify({"error": "Module ID is required"}), 400

    points_model = PointChallenge()
    total_points = points_model.get_total_points(user_id, module_id)

    return jsonify({"total_points": total_points})




@jwt_required()
def user_courses():
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID not found in token"}), 401

    chosen_domain_data = chosen_domain.get_chosen(user_id)
    if not chosen_domain_data:
        return jsonify({"error": "Chosen Domain not found"}), 404

    domain_id = chosen_domain_data['domain_id']
    courses_model = Courses()
    courses = courses_model.get_courses(domain_id)

    courses_json = []
    for course in courses:
        course_dict = {
            'id': course['id'],
            'course_name': course['course_name'],
            'description': course['description']
        }
        courses_json.append(course_dict)

    print("Fetched Courses: ", courses_json)
    return jsonify(courses_json)

