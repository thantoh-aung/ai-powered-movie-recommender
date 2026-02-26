from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import get_recommendations

class RecommendMovieView(APIView):
    def post(self, request):
        genre = request.data.get('genre', 'any')
        mood = request.data.get('mood', 'any')
        search_query = request.data.get('search_query', '')
        
        try:
            age = int(request.data.get('age', 18))
        except ValueError:
            age = 18

        recommendations = get_recommendations(genre, mood, age, search_query)
        
        if not recommendations:
             return Response({"message": "No movies found matching your preferences. Try adjusting them!"}, status=status.HTTP_200_OK)
             
        return Response({"recommendations": recommendations}, status=status.HTTP_200_OK)
