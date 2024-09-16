import sqlite3
import os


class BaseModel:
    def __init__(self):
        self.db = os.path.join(os.path.dirname(__file__), '..', 'backend', 'db-presentation.sqlite3')
        self.conn_db = sqlite3.connect(self.db, check_same_thread=False)

    def get_cursor(self):
        cursor = self.conn_db.cursor()
        cursor.row_factory = sqlite3.Row
        return cursor


class Courses(BaseModel):
    def get_domain_name(self, id):
        cursor = self.get_cursor()
        query = """SELECT domain_name FROM Domains WHERE id = ?"""
        cursor.execute(query, (id,))
        return cursor.fetchone()

    def get_courses(self, domain_id):
        cursor = self.get_cursor()
        query = """SELECT * FROM Courses WHERE domain_id = ?"""
        cursor.execute(query, (domain_id,))
        return cursor.fetchall()


class Domains(BaseModel):
    def get_domains(self):
        cursor = self.get_cursor()
        query = """SELECT * FROM Domains"""
        cursor.execute(query)
        return cursor.fetchall()


class ChosenDomain(BaseModel):
    def get_chosen(self, user_id):
        cursor = self.get_cursor()
        query = """SELECT domain_id FROM Users WHERE id = ?"""
        cursor.execute(query, (user_id,))
        chosen_domain = cursor.fetchone()

        if chosen_domain:
            return chosen_domain
        else:
            return None


class Instances(BaseModel):
    def get_instances(self, course_id):
        cursor = self.get_cursor()
        query = """SELECT * FROM Instances WHERE course_id = ?"""
        cursor.execute(query, (course_id,))
        return cursor.fetchall()


class Modules(BaseModel):
    def get_modules(self, instance_id):
        cursor = self.get_cursor()
        query = """SELECT * FROM Modules WHERE instance_id = ?"""
        cursor.execute(query, (instance_id,))
        return cursor.fetchall()

    def get_module(self, module_id):
        cursor = self.get_cursor()
        query = """SELECT * FROM Modules WHERE id = ?"""
        cursor.execute(query, (module_id,))
        return cursor.fetchone()


class Activities(BaseModel):
    def get_activities(self, module_id):
        cursor = self.get_cursor()
        query = """
        SELECT 
            a.id, a.activity_name, a.level, a.module_id, ag.group_name
        FROM 
            Activities a
        JOIN 
            ActivityGroups ag ON a.group_id = ag.id
        WHERE 
            a.module_id = ?
        ORDER BY 
            ag.group_name, a.level;
        """
        cursor.execute(query, (module_id,))
        return cursor.fetchall()


class UserProgress(BaseModel):
    def start_activity(self, user_id, activity_id):
        cursor = self.get_cursor()
        status_id = 2  # Status for 'started'
        cursor.execute('INSERT INTO UserProgress (user_id, activity_id, status_id) VALUES (?, ?, ?)',
                       (user_id, activity_id, status_id))
        self.conn_db.commit()

    def complete_activity(self, user_id, activity_id):
        cursor = self.get_cursor()
        status_id = 5  # Status for 'submitted'
        cursor.execute(
            'UPDATE UserProgress SET status_id = ?, date_completed = CURRENT_DATE WHERE user_id = ? AND activity_id = ?',
            (status_id, user_id, activity_id))
        self.conn_db.commit()

    def get_progress(self, user_id, activity_id):
        cursor = self.get_cursor()
        query = """SELECT status_id FROM UserProgress WHERE user_id = ? AND activity_id = ?"""
        cursor.execute(query, (user_id, activity_id))
        progress = cursor.fetchone()
        if progress:
            return {'status_id': progress['status_id']}
        return {'status_id': 1}  # Default to 'not_started'

    def get_user_completed_activities(self, user_id, module_id):
        cursor = self.get_cursor()
        query = """
        SELECT a.id, a.activity_name, ag.group_name
        FROM UserProgress up
        JOIN Activities a ON up.activity_id = a.id
        JOIN ActivityGroups ag ON a.group_id = ag.id
        WHERE up.user_id = ? AND a.module_id = ? AND up.status_id = 5
        """
        cursor.execute(query, (user_id, module_id))
        return cursor.fetchall()

    def get_remaining_activities(self, user_id, module_id):
        cursor = self.get_cursor()
        query = """
        SELECT COUNT(*)
        FROM Activities a
        LEFT JOIN UserProgress up ON a.id = up.activity_id AND up.user_id = ?
        WHERE a.module_id = ? AND (up.status_id IS NULL OR up.status_id != 5)
        """
        cursor.execute(query, (user_id, module_id))
        remaining_activities_count = cursor.fetchone()[0]
        return remaining_activities_count


class Teachers(BaseModel):
    def get_progresses(self):
        cursor = self.get_cursor()
        query = """
            SELECT 
                a.activity_name as activity, 
                u.firstname as student, 
                s.status_name as status, 
                up.date_completed as date
            FROM UserProgress up
            JOIN Activities a ON up.activity_id = a.id
            JOIN Users u ON up.user_id = u.id
            JOIN Status s ON up.status_id = s.id
        """
        cursor.execute(query)
        return cursor.fetchall()

    def get_activity_id(self, activity_name):
        cursor = self.get_cursor()
        query = """SELECT id FROM Activities WHERE activity_name = ?"""
        cursor.execute(query, (activity_name,))
        return cursor.fetchone()

    def get_status_id(self, status_name):
        cursor = self.get_cursor()
        query = """SELECT id FROM Status WHERE status_name = ?"""
        cursor.execute(query, (status_name,))
        return cursor.fetchone()

    def update_status(self, activity_id, status_id):
        cursor = self.get_cursor()
        query = "UPDATE UserProgress SET status_id = ? WHERE activity_id = ?"
        cursor.execute(query, (status_id, activity_id))
        self.conn_db.commit()


class PointChallenge(BaseModel):
    def award_points(self, user_id, module_id, activity_id, points_awarded):
        cursor = self.get_cursor()
        query = """
        INSERT INTO Points (user_id, module_id, activity_id, points)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, module_id, activity_id) DO UPDATE SET points = points + ?
        """
        cursor.execute(query, (user_id, module_id, activity_id, points_awarded, points_awarded))
        self.conn_db.commit()

    def get_total_points(self, user_id, module_id):
        cursor = self.get_cursor()
        query = """
        SELECT SUM(points) as total_points FROM Points WHERE user_id = ? AND module_id = ?
        """
        cursor.execute(query, (user_id, module_id))
        result = cursor.fetchone()
        return result['total_points'] if result and result['total_points'] is not None else 0

    def set_total_points(self, user_id, module_id, total_points):
        cursor = self.get_cursor()
        query = """
        UPDATE Points SET points = ?
        WHERE user_id = ? AND module_id = ?
        """
        cursor.execute(query, (total_points, user_id, module_id))
        self.conn_db.commit()

    def is_point_challenge_completed(self, user_id, module_id):
        cursor = self.get_cursor()
        query = """
        SELECT completed FROM PointChallenge WHERE user_id = ? AND module_id = ?
        """
        cursor.execute(query, (user_id, module_id))
        result = cursor.fetchone()
        return result['completed'] if result else False

    def complete_point_challenge(self, user_id, module_id):
        cursor = self.get_cursor()
        query = """
        INSERT INTO PointChallenge (user_id, module_id, completed)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, module_id) DO UPDATE SET completed = ?
        """
        cursor.execute(query, (user_id, module_id, True, True))
        self.award_points(user_id, module_id, None, 50)
        self.conn_db.commit()


class UserModule(BaseModel):
    def unlock_module(self, user_id, module_id):
        cursor = self.get_cursor()
        cursor.execute('INSERT INTO UserModules (user_id, module_id, is_unlocked) VALUES (?, ?, 1)',
                       (user_id, module_id))
        self.conn_db.commit()

    def is_module_unlocked(self, user_id, module_id):
        cursor = self.get_cursor()
        query = 'SELECT is_unlocked FROM UserModules WHERE user_id = ? AND module_id = ?'
        cursor.execute(query, (user_id, module_id))
        result = cursor.fetchone()
        return result['is_unlocked'] if result else False


class UserConceptChallenge(BaseModel):
    def complete_concept_challenge(self, user_id, module_id):
        cursor = self.get_cursor()
        cursor.execute(
            'INSERT OR REPLACE INTO UserConceptChallenges (user_id, module_id, is_completed) VALUES (?, ?, 1)',
            (user_id, module_id))
        self.conn_db.commit()

    def is_concept_challenge_completed(self, user_id, module_id):
        cursor = self.get_cursor()
        query = 'SELECT is_completed FROM UserConceptChallenges WHERE user_id = ? AND module_id = ?'
        cursor.execute(query, (user_id, module_id))
        result = cursor.fetchone()
        return result['is_completed'] if result else False


class UserCoreAssignment(BaseModel):
    def complete_core_assignment(self, user_id, module_id):
        cursor = self.get_cursor()
        cursor.execute('INSERT OR REPLACE INTO UserCoreAssignments (user_id, module_id, is_completed) VALUES (?, ?, 1)',
                       (user_id, module_id))
        self.conn_db.commit()

    def is_core_assignment_completed(self, user_id, module_id):
        cursor = self.get_cursor()
        query = 'SELECT is_completed FROM UserCoreAssignments WHERE user_id = ? AND module_id = ?'
        cursor.execute(query, (user_id, module_id))
        result = cursor.fetchone()
        return result['is_completed'] if result else False


class CoreAssignment(BaseModel):
    def get_assignments(self, module_id):
        cursor = self.get_cursor()
        query = 'SELECT * FROM CoreAssignments WHERE module_id = ?'
        cursor.execute(query, (module_id,))
        return cursor.fetchall()


class ConceptChallenge(BaseModel):
    def get_challenges(self, module_id):
        cursor = self.get_cursor()
        query = 'SELECT * FROM ConceptChallenges WHERE module_id = ?'
        cursor.execute(query, (module_id,))
        return cursor.fetchall()
