from flask import jsonify, request
from backend.sqlite_models import Teachers
from flask_jwt_extended import jwt_required, get_jwt_identity


def teacher_progress_dashboard():
    teacher_model = Teachers()
    progresses = teacher_model.get_progresses()

    progresses_json = []
    for progress in progresses:
        progress_dict = {
            'activity': progress['activity'],
            'student': progress['student'],
            'status': progress['status'],
            'date': progress['date']
        }
        progresses_json.append(progress_dict)

    return jsonify(progresses_json)


def grade_progress():
    if request.method == 'POST':
        data = request.get_json()
        activity_name = data['activity']
        status_name = data['status']

        teacher_model = Teachers()
        activity_id = teacher_model.get_activity_id(activity_name)
        status_id = teacher_model.get_status_id(status_name)
        teacher_model.update_status(activity_id[0], status_id[0])
        return jsonify({'message': f'{data} received.'})
    else:
        return jsonify({'error': 'Could not receive data.'}), 405
