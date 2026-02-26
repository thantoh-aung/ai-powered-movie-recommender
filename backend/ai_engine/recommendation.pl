% Explainable AI Movie Recommendation Engine
% Knowledge Base

:- dynamic movie/7.
% movie(ID, Title, Genres, Moods, MinAge, ReleaseYear, PopularityScore).
movie(1, 'Inception', ['sci-fi', 'action', 'thriller'], ['mind-bending', 'thrilling'], 13, 2010, 88).
movie(2, 'The Matrix', ['sci-fi', 'action'], ['mind-bending', 'dark', 'action-packed'], 15, 1999, 87).
movie(3, 'Interstellar', ['sci-fi', 'drama', 'adventure'], ['emotional', 'mind-bending', 'awe-inspiring'], 13, 2014, 86).
movie(4, 'The Godfather', ['crime', 'drama'], ['dark', 'thought-provoking', 'tense'], 18, 1972, 92).
movie(5, 'Toy Story', ['animation', 'comedy', 'family'], ['funny', 'heartwarming', 'lighthearted'], 0, 1995, 83).
movie(6, 'The Dark Knight', ['action', 'crime', 'drama'], ['dark', 'thrilling', 'action-packed'], 13, 2008, 90).
movie(7, 'Pulp Fiction', ['crime', 'drama'], ['dark', 'funny', 'quirky'], 18, 1994, 89).
movie(8, 'Forrest Gump', ['drama', 'romance'], ['emotional', 'heartwarming', 'inspiring'], 13, 1994, 88).
movie(9, 'The Shawshank Redemption', ['drama'], ['emotional', 'thought-provoking', 'inspiring'], 15, 1994, 93).
movie(10, 'Spirited Away', ['animation', 'fantasy', 'family'], ['magical', 'emotional', 'awe-inspiring'], 10, 2001, 86).
movie(11, 'Spider-Man: Into the Spider-Verse', ['animation', 'action', 'adventure'], ['thrilling', 'funny', 'visually-stunning'], 10, 2018, 84).
movie(12, 'Parasite', ['thriller', 'drama', 'comedy'], ['dark', 'thought-provoking', 'tense'], 15, 2019, 85).
movie(13, 'Avengers: Endgame', ['action', 'sci-fi', 'adventure'], ['action-packed', 'emotional', 'epic'], 13, 2019, 84).
movie(14, 'La La Land', ['romance', 'musical', 'drama'], ['romantic', 'emotional', 'artistic'], 13, 2016, 80).
movie(15, 'Mad Max: Fury Road', ['action', 'sci-fi', 'adventure'], ['action-packed', 'thrilling', 'intense'], 15, 2015, 81).
movie(16, 'Everything Everywhere All at Once', ['sci-fi', 'comedy', 'action'], ['mind-bending', 'funny', 'emotional'], 15, 2022, 80).
movie(17, 'Get Out', ['horror', 'thriller', 'mystery'], ['dark', 'thought-provoking', 'tense'], 15, 2017, 77).
movie(18, 'The Grand Budapest Hotel', ['comedy', 'drama'], ['quirky', 'funny', 'artistic'], 15, 2014, 81).
movie(19, 'Blade Runner 2049', ['sci-fi', 'thriller', 'drama'], ['thought-provoking', 'visually-stunning', 'slow-burn'], 15, 2017, 80).
movie(20, 'Coco', ['animation', 'family', 'adventure'], ['emotional', 'heartwarming', 'musical'], 0, 2017, 84).
movie(21, 'The Silence of the Lambs', ['crime', 'thriller', 'horror'], ['dark', 'tense', 'thought-provoking'], 18, 1991, 85).
movie(22, 'Schindler''s List', ['drama', 'history'], ['emotional', 'thought-provoking', 'dark'], 18, 1993, 88).
movie(23, 'Goodfellas', ['crime', 'drama'], ['dark', 'action-packed', 'intense'], 18, 1990, 87).
movie(24, 'The Lord of the Rings: The Return of the King', ['fantasy', 'action', 'adventure'], ['epic', 'awe-inspiring', 'emotional'], 13, 2003, 90).
movie(25, 'Fight Club', ['drama', 'thriller'], ['dark', 'mind-bending', 'thought-provoking'], 18, 1999, 88).
movie(26, 'The Empire Strikes Back', ['sci-fi', 'action', 'adventure'], ['epic', 'action-packed', 'awe-inspiring'], 10, 1980, 89).
movie(27, 'Se7en', ['crime', 'mystery', 'thriller'], ['dark', 'tense', 'mind-bending'], 18, 1995, 86).
movie(28, 'Gladiator', ['action', 'drama', 'history'], ['epic', 'action-packed', 'emotional'], 15, 2000, 85).
movie(29, 'The Lion King', ['animation', 'family', 'adventure'], ['emotional', 'awe-inspiring', 'heartwarming'], 0, 1994, 87).
movie(30, 'Jurassic Park', ['sci-fi', 'action', 'adventure'], ['thrilling', 'awe-inspiring', 'action-packed'], 13, 1993, 86).
movie(31, 'Terminator 2: Judgment Day', ['action', 'sci-fi'], ['action-packed', 'thrilling', 'intense'], 15, 1991, 85).
movie(32, 'Back to the Future', ['sci-fi', 'comedy', 'adventure'], ['fun', 'lighthearted', 'thought-provoking'], 10, 1985, 87).
movie(33, 'Psycho', ['horror', 'thriller', 'mystery'], ['dark', 'tense', 'thrilling'], 15, 1960, 84).
movie(34, 'The Usual Suspects', ['crime', 'mystery', 'thriller'], ['mind-bending', 'tense', 'dark'], 18, 1995, 85).
movie(35, 'City of God', ['crime', 'drama'], ['dark', 'intense', 'thought-provoking'], 18, 2002, 86).
movie(36, 'Princess Mononoke', ['animation', 'fantasy', 'adventure'], ['epic', 'thought-provoking', 'awe-inspiring'], 13, 1997, 85).
movie(37, 'Alien', ['horror', 'sci-fi', 'thriller'], ['dark', 'tense', 'thrilling'], 18, 1979, 86).
movie(38, 'Memento', ['mystery', 'thriller'], ['mind-bending', 'tense', 'thought-provoking'], 15, 2000, 84).
movie(39, 'Apocalypse Now', ['drama', 'war'], ['dark', 'intense', 'thought-provoking'], 18, 1979, 85).
movie(40, 'Indiana Jones and the Raiders of the Lost Ark', ['action', 'adventure'], ['action-packed', 'thrilling', 'fun'], 10, 1981, 86).
movie(41, 'WALL-E', ['animation', 'sci-fi', 'family'], ['heartwarming', 'thought-provoking', 'emotional'], 0, 2008, 85).
movie(42, 'The Shining', ['horror', 'thriller'], ['dark', 'tense', 'mind-bending'], 18, 1980, 84).
movie(43, 'Django Unchained', ['western', 'action', 'drama'], ['action-packed', 'dark', 'intense'], 18, 2012, 85).
movie(44, 'The Truman Show', ['comedy', 'drama', 'sci-fi'], ['thought-provoking', 'mind-bending', 'emotional'], 10, 1998, 83).
movie(45, 'Whiplash', ['drama', 'music'], ['intense', 'emotional', 'thought-provoking'], 15, 2014, 85).
movie(46, 'The Prestige', ['drama', 'mystery', 'sci-fi'], ['mind-bending', 'tense', 'dark'], 13, 2006, 85).
movie(47, 'The Departed', ['crime', 'drama', 'thriller'], ['tense', 'dark', 'action-packed'], 18, 2006, 85).
movie(48, 'Snatch', ['comedy', 'crime'], ['quirky', 'funny', 'action-packed'], 18, 2000, 82).
movie(49, 'Amelie', ['comedy', 'romance'], ['quirky', 'heartwarming', 'romantic'], 15, 2001, 83).
movie(50, 'A Clockwork Orange', ['crime', 'sci-fi', 'drama'], ['dark', 'mind-bending', 'thought-provoking'], 18, 1971, 83).

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
