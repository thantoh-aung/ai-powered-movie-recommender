% Explainable AI Movie Recommendation Engine
% Knowledge Base

:- dynamic movie/7.
:- dynamic user_likes/2.
% movie(ID, Title, Genres, Moods, MinAge, ReleaseYear, PopularityScore).
% user_likes(UserID, MovieID).

% Helper: Match preference or accept 'any'
match_pref(Pref, _) :- Pref == any.
match_pref(Pref, List) :- Pref \== any, member(Pref, List).

% Helper: Check minimum rating/age
check_rating(UserAge, MinAge) :- UserAge >= MinAge.

% Rules: Recommend a movie based on Genre, Mood, and Age
% recommend_movie(Genre, Mood, UserAge, Title, Explanation, Popularity).
recommend_movie(PrefGenre, PrefMood, UserAge, Title, Explanation, Popularity) :-
    movie(_, Title, Genres, Moods, MinAge, _, Popularity),
    check_rating(UserAge, MinAge),
    match_pref(PrefGenre, Genres),
    match_pref(PrefMood, Moods),
    construct_explanation(PrefGenre, PrefMood, Title, MinAge, Genres, Moods, Explanation).

% Rules: Recommend a movie from a strictly provided list of IDs (Hybrid AI)
recommend_movie_in_pool(PrefGenre, PrefMood, UserAge, PoolIDs, Title, Explanation, Popularity) :-
    movie(ID, Title, Genres, Moods, MinAge, _, Popularity),
    member(ID, PoolIDs),
    check_rating(UserAge, MinAge),
    match_pref(PrefGenre, Genres),
    match_pref(PrefMood, Moods),
    construct_explanation(PrefGenre, PrefMood, Title, MinAge, Genres, Moods, Explanation).

% Rules: Recommend a movie based on user's watch history (Collaborative/Content Hybrid)
recommend_similar_to_liked(UserID, UserAge, Title, Explanation, Popularity) :-
    user_likes(UserID, LikedMovieID),
    movie(LikedMovieID, LikedTitle, LikedGenres, LikedMoods, _, _, _),
    movie(_, Title, Genres, Moods, MinAge, _, Popularity),
    Title \== LikedTitle,
    check_rating(UserAge, MinAge),
    member(G, LikedGenres), member(G, Genres),
    member(M, LikedMoods), member(M, Moods),
    atomic_list_concat(['Recommended because you liked ', LikedTitle, ', which shares the ', G, ' genre and ', M, ' vibe.'], Explanation).

% Explanation Generation
construct_explanation(any, any, _, MinAge, _, _, Explanation) :-
    atomic_list_concat(['Recommended as a great general watch suitable for your age (rated for ', MinAge, '+).'], Explanation).

construct_explanation(PrefGenre, any, _, _, _, _, Explanation) :-
    PrefGenre \== any,
    atomic_list_concat(['Recommended because it strongly matches your preferred genre (', PrefGenre, ') and is appropriate for your age group.'], Explanation).

construct_explanation(any, PrefMood, _, _, _, _, Explanation) :-
    PrefMood \== any,
    atomic_list_concat(['Recommended because it delivers the ', PrefMood, ' vibe you are looking for, while being suitable for your age.'], Explanation).

construct_explanation(PrefGenre, PrefMood, _, MinAge, _, _, Explanation) :-
    PrefGenre \== any,
    PrefMood \== any,
    atomic_list_concat(['This movie is a perfect fit. It is a ', PrefGenre, ' movie that matches your ', PrefMood, ' mood, and is rated for viewers ', MinAge, ' and up.'], Explanation).
