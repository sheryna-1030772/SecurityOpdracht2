from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import os
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

from controller.authentication import login, logout, register
from controller.user_management import home
from controller.teacher_management import teacher_progress_dashboard, grade_progress
from controller.course_management import (courses_dashboard, domains_dashboard, get_chosen_domain, instances_dashboard,
                                          modules_dash, activities_dashboard, start_activity, complete_activity,
                                          get_domains, complete_concept_challenge, complete_core_assignment,
                                          get_module_status, get_total_points,
                                          modules_dash, activities_dashboard, start_activity, complete_activity, get_domains,
                                          user_courses)

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'fallback_secret_key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback_jwt_secret_key')
CORS(app, resources={r"/api/*": {"origins": os.getenv('CORS_ALLOWED_ORIGINS', '*').split(',')}}, supports_credentials=True)

jwt = JWTManager(app)


@app.before_request
def handle_options_request():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token, Authorization')
        return response


app.add_url_rule('/', 'home', home)
app.add_url_rule('/api/login', 'login', login, methods=['POST'])
app.add_url_rule('/api/logout', 'logout', logout, methods=['POST'])
app.add_url_rule('/api/register', 'register', register, methods=['GET', 'POST'])
app.add_url_rule('/api/domain=<int:domain_id>', 'courses_dashboard', courses_dashboard, methods=['GET'])
app.add_url_rule('/api/domains', 'domains_dashboard', domains_dashboard, methods=['GET'])
app.add_url_rule('/api/register/domains', 'get_domains', get_domains, methods=['GET'])
app.add_url_rule('/api/chosen_domain', 'get_chosen_domain', get_chosen_domain, methods=['GET'])
app.add_url_rule('/api/course=<int:course_id>', 'instances_dashboard', instances_dashboard, methods=['GET'])
app.add_url_rule('/api/teacher/dashboard/progress', 'teacher_progress_dashboard', teacher_progress_dashboard,
                 methods=['GET'])
app.add_url_rule('/api/teacher/dashboard/progress/grade', 'grade_progress', grade_progress, methods=['POST'])
app.add_url_rule('/api/modules=<int:instances_id>', 'modules_dash', modules_dash, methods=['GET'])
app.add_url_rule('/api/activities', 'activities_dashboard', activities_dashboard, methods=['GET'])
app.add_url_rule('/api/startActivity', 'start_activity', start_activity, methods=['POST'])
app.add_url_rule('/api/completeActivity', 'complete_activity', complete_activity, methods=['POST'])
app.add_url_rule('/api/points', 'get_total_points', get_total_points, methods=['GET'])
app.add_url_rule('/api/completeConceptChallenge', 'complete_concept_challenge', complete_concept_challenge,
                 methods=['POST'])
app.add_url_rule('/api/completeCoreAssignment', 'complete_core_assignment', complete_core_assignment, methods=['POST'])
app.add_url_rule('/api/moduleStatus', 'get_module_status', get_module_status, methods=['GET'])
app.add_url_rule('/api/user_courses', 'user_courses', user_courses, methods=['GET'])



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true')