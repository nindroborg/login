CREATE TABLE jwt (
	id_jwt SERIAL PRIMARY KEY,
	userid int,
	activeToken varchar(200),
	refreshToken varchar(200)
) 