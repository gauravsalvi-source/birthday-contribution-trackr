--
-- PostgreSQL database dump
--

\restrict 0omsfpdVd3vZtJPPUqLQRfBkQvxLU1NM3xbxfTkKCJYaMIdDmHecPSe2TlfkuGi

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: birthday_tracker_db_jh26_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO birthday_tracker_db_jh26_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: birthday_tracker_db_jh26_user
--

CREATE TABLE public.expenses (
    id text NOT NULL,
    birthdaymonth text,
    birthdayfor text,
    item text,
    amount integer,
    eventtype text DEFAULT 'birthday'::text
);


ALTER TABLE public.expenses OWNER TO birthday_tracker_db_jh26_user;

--
-- Name: records; Type: TABLE; Schema: public; Owner: birthday_tracker_db_jh26_user
--

CREATE TABLE public.records (
    id text NOT NULL,
    birthdaymonth text,
    birthdayfor text,
    name text,
    status text,
    contribution integer,
    birthdate text,
    statusremark text,
    note text,
    eventtype text DEFAULT 'birthday'::text
);


ALTER TABLE public.records OWNER TO birthday_tracker_db_jh26_user;

--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: birthday_tracker_db_jh26_user
--

COPY public.expenses (id, birthdaymonth, birthdayfor, item, amount, eventtype) FROM stdin;
20998775-2fdc-4b84-8333-a2979dc14fa8	2026-02	Juhee & Sangeeta	Cake	453	birthday
b6665966-1ac3-4885-93ea-ca7f3aa22f57	2026-02	Juhee & Sangeeta	Cake	406	birthday
a5a808c5-633e-45b5-81fd-d284327d9505	2026-02	Juhee & Sangeeta	Sevpuri	210	birthday
4756a41c-6582-410f-b797-d19a6f538a38	2026-02	Juhee & Sangeeta	Ice cream	200	birthday
5fe4c6ae-dad8-4476-a814-2e50bd4f77e7	2026-02	Juhee & Sangeeta	Food	334	birthday
7e721557-7da4-453f-8df4-0fb45010a295	2026-02	Juhee & Sangeeta	Sevpuri	420	birthday
4ad8cb71-e852-46c2-8126-f041a6ddb103	2026-04	Rushab & Sweta	Cake	420	birthday
9f60bc7e-3338-4c92-bbd5-611230627c9f	2026-04	Rushab & Sweta	Cake	427	birthday
4799cffc-da15-4510-88e8-971c2a4aeb0b	2026-04	Rushab & Sweta	Tiffin	599	birthday
4129eb6f-fa25-4dc9-bd1a-0bbddfa24e26	2026-05	Sumit, Lalit  & Bhakti	Cake	531	birthday
daa1ff63-d5d5-4a45-839a-5d182f9e8d8c	2026-05	Sumit, Lalit  & Bhakti	Cake	418	birthday
fe881f46-681e-4b5d-ba7f-bc56127f4f3b	2026-02	Lalit's Baby	Gift	1700	babyGift
bccd5df3-4487-46fa-a6bd-b517dee05d70	2026-02	Lalit's Baby	Gift	1598	babyGift
03b8ab37-b787-477f-ae5d-c7924e721345	2026-05	Sumit, Lalit  & Bhakti	Samosa	250	birthday
eadacae8-ba26-4e65-9dd5-0d6cdd8dd615	2026-05	Sumit, Lalit  & Bhakti	Sevpuri	300	birthday
6206e1d3-090d-4962-896f-517e99150b69	2026-05	Sumit, Lalit  & Bhakti	Cake	418	birthday
\.


--
-- Data for Name: records; Type: TABLE DATA; Schema: public; Owner: birthday_tracker_db_jh26_user
--

COPY public.records (id, birthdaymonth, birthdayfor, name, status, contribution, birthdate, statusremark, note, eventtype) FROM stdin;
575f41d7-dde8-4955-8c41-992f7e4dcd49	2026-02	Lalit's Baby	Opening Balance	Paid	375			Opening Balance Adjustment	babyGift
6fa827b4-3d3f-457d-9a1b-e8722445fabd	2026-04	Rushab & Sweta	Ankit	Paid	200				birthday
03c8fe75-b0a3-4d19-9209-f1bcf7cc1062	2026-04	Rushab & Sweta	Juhee	Paid	100				birthday
fa761116-a54d-4925-95b2-6cb48bddd342	2026-04	Rushab & Sweta	Rushab	Exempted	0			Birthday Employee	birthday
4ebcaa38-9964-4f70-8420-b6481a04d720	2026-04	Rushab & Sweta	Sweta	Exempted	0			Birthday Employee	birthday
4992f9e7-7777-4f42-bb3f-28896478b7c7	2026-04	Rushab & Sweta	Aniket	Paid	100				birthday
910431c9-3c22-45da-84dc-665291d31943	2026-04	Rushab & Sweta	Bhakti	Paid	100				birthday
4a9728c3-d369-4985-b5a7-464d1c26232b	2026-04	Rushab & Sweta	Gaurav	Paid	100				birthday
c11d739d-723a-4242-bc9a-3766fabcdfae	2026-04	Rushab & Sweta	Ishwar	Paid	100				birthday
3a262cb8-11c8-4d9c-aa19-2be6964df7eb	2026-04	Rushab & Sweta	Lalit	Paid	100				birthday
26c24ba4-fef1-40bc-9045-8e0cc73b0b5b	2026-04	Rushab & Sweta	Mane	Paid	100				birthday
cb30f4e9-98c7-4e25-873c-91d9c73fa3f7	2026-04	Rushab & Sweta	Mohammed	Paid	100				birthday
432de697-c311-4bcd-a880-809736551a28	2026-04	Rushab & Sweta	Nehal	Paid	100				birthday
9ab5955f-9775-41e2-a1a0-5355884fa801	2026-04	Rushab & Sweta	Pawan	Paid	100				birthday
757c5213-152c-43b9-8263-03630e68899a	2026-04	Rushab & Sweta	Riddhi	Paid	100				birthday
3daf9e1c-cdfe-4486-a2f1-e0cb874e3fcb	2026-04	Rushab & Sweta	Rupali	Paid	100				birthday
4b497838-fb12-43f7-b157-6e080262cc68	2026-04	Rushab & Sweta	Samiran	Paid	100				birthday
99e9b6cb-6c30-4e45-b0cd-21853f6a860d	2026-04	Rushab & Sweta	Sangeeta	NA	0				birthday
a91125d5-c090-449c-81e5-e6aab50409cc	2026-04	Rushab & Sweta	Sayali	Paid	100				birthday
4bdcb28a-76f0-473e-bd61-5a6ca0f4d2e5	2026-04	Rushab & Sweta	Shivam	Paid	100				birthday
b2409a1f-ea45-45bd-8654-8be26ba6cbaf	2026-04	Rushab & Sweta	Sumit	Paid	100				birthday
8ea7551f-590a-4501-8213-12fe159fff3a	2026-04	Rushab & Sweta	Prathamesh	Paid	100				birthday
54e37284-ecd5-4df6-bcf4-29610774f936	2026-02	Juhee & Sangeeta	Gaurav	Paid	100			Balance 375	birthday
0872625e-aaab-4f39-819c-08b595a9f7f4	2026-02	Juhee & Sangeeta	Lalit	Paid	100				birthday
6585618f-7b1a-4b55-af5a-d971fad8b289	2026-02	Juhee & Sangeeta	Mane	Paid	100				birthday
0e0548dc-0202-4429-b83a-d39e51adbb82	2026-02	Juhee & Sangeeta	Pawan	Paid	100				birthday
a2861b01-4601-4754-b86b-01930550e2fd	2026-02	Juhee & Sangeeta	Aniket	Paid	100				birthday
463b749b-bf57-486e-ae20-432cdcb54e12	2026-02	Juhee & Sangeeta	Ishwar	Paid	100				birthday
0c2bc193-8b21-463f-b03e-d83458f02e7a	2026-02	Juhee & Sangeeta	Rupali	Paid	100				birthday
22a719fb-f64d-41ae-8c8a-252cbb911905	2026-02	Juhee & Sangeeta	Sayali	Paid	100				birthday
9cadcdf7-3b4c-4cca-abb7-b24a1a5b845d	2026-02	Lalit's Baby	Aniket	Paid	150				babyGift
ec2426bf-1cf5-411b-b5cf-bf5bf19577d5	2026-02	Lalit's Baby	Bhakti	Paid	150				babyGift
a168414f-65b5-4e63-80dc-abf62b0a1424	2026-02	Lalit's Baby	Gaurav	Paid	150				babyGift
1b69b9d7-63e4-4a49-9f10-114e8f6aedc4	2026-05	Sumit, Lalit  & Bhakti	Bhakti	Exempted	0			Birthday Employee	birthday
47986f72-3af4-4e40-94c4-e1fc613effbd	2026-05	Sumit, Lalit  & Bhakti	Sumit	Exempted	0			Birthday Employee	birthday
b8d43e45-afb1-42b9-b2df-576b8b99cf2f	2026-05	Sumit, Lalit  & Bhakti	Lalit	Exempted	0			Birthday Employee	birthday
214138e3-442b-4c15-9e32-2a565bea853b	2026-02	Juhee & Sangeeta	Sangeeta	Exempted	0		Birthday Employee	Birthday Employee	birthday
ef67e35d-2aec-47b4-a486-7e865ecc0fd0	2026-02	Lalit's Baby	Mane	Paid	150				babyGift
e57ab0e2-2bfe-4510-adb6-9508365dd843	2026-02	Juhee & Sangeeta	Mohammed	NA	0				birthday
35ead99f-90f6-42bb-b46c-ea1a1906950e	2026-05	Sumit, Lalit  & Bhakti	Shivam	Pending	100				birthday
2c0dc603-5347-4026-838f-ea1647ac89d8	2026-05	Sumit, Lalit  & Bhakti	Ankit	Paid	100				birthday
52788ba4-3c36-45dc-a571-9b1924fb1a77	2026-05	Sumit, Lalit  & Bhakti	Gaurav	Paid	100				birthday
44823460-cb73-4fd2-a4a0-270ffe4a8f2c	2026-05	Sumit, Lalit  & Bhakti	Mane	Paid	100				birthday
087a77f0-6ebf-4a0f-ae83-48297be20827	2026-05	Sumit, Lalit  & Bhakti	Mohammed	Paid	100				birthday
137df411-fa80-44c0-9992-427db5566ee9	2026-05	Sumit, Lalit  & Bhakti	Pawan	Paid	100				birthday
4ff963fb-2d38-41b3-82be-70c65dd39d8c	2026-05	Sumit, Lalit  & Bhakti	Prathamesh	Paid	100				birthday
5c50b80a-6d38-4e41-84e5-75e04192e6fc	2026-05	Sumit, Lalit  & Bhakti	Rupali	Paid	100				birthday
8cd00f38-700e-47c7-b966-54bd35fd724f	2026-05	Sumit, Lalit  & Bhakti	Rushab	Paid	100				birthday
7a549e4a-d39f-4bbd-83f4-3537e8b4115d	2026-05	Sumit, Lalit  & Bhakti	Samiran	Paid	100				birthday
73b1f44e-0c11-4fc5-8304-150124c94164	2026-05	Sumit, Lalit  & Bhakti	Sangeeta	Paid	100				birthday
644a0407-a46b-480b-8893-8a172e3623ff	2026-02	Lalit's Baby	Mohammed	Paid	150				babyGift
f7dbbc4e-a521-45d3-8957-38eeec4927dd	2026-02	Lalit's Baby	Nehal	Paid	150				babyGift
764ebed6-0ed0-44eb-b860-d2dcfec024e1	2026-02	Juhee & Sangeeta	Opening Balance	Paid	0			Opening Balance Adjustment	birthday
84abfbd7-e7a3-4940-935c-9e55d20cc00c	2026-05	Sumit, Lalit  & Bhakti	Juhee	Paid	100				birthday
e0f24fea-f72c-4808-afb5-8107995ef4f5	2026-02	Juhee & Sangeeta	Bhakti	Paid	100				birthday
7f4222db-ed3f-4b4a-9994-04c72823069a	2026-02	Juhee & Sangeeta	Shivam	Paid	100				birthday
cd70b285-a095-4cb0-894c-0dd654d44541	2026-02	Juhee & Sangeeta	Samiran	Paid	100				birthday
84120a01-e2fb-42e6-ae20-7fa11210302e	2026-02	Juhee & Sangeeta	Sumit	Paid	100				birthday
129af0ad-a3bb-4982-9bf6-2286e81d0ae0	2026-02	Juhee & Sangeeta	Nehal	Paid	100				birthday
75f06b24-d8c0-4e8b-ae1e-1f2678e1bca0	2026-02	Juhee & Sangeeta	Prathamesh	Paid	100				birthday
5e046d62-5b6d-4814-bb40-73d7a3449165	2026-02	Juhee & Sangeeta	Riddhi	Paid	100				birthday
0c9dcfd6-9215-457f-8bb0-73f4ac01923f	2026-02	Juhee & Sangeeta	Rushab	Paid	100				birthday
26ccb4d7-b16f-4f9c-8ced-b4a829be9098	2026-02	Juhee & Sangeeta	Sweta	Paid	100				birthday
ff0b4995-c16c-4551-962a-98310184f078	2026-02	Juhee & Sangeeta	Juhee	Exempted	0		Birthday Employee	Birthday Employee	birthday
bfc2be93-2e96-42f9-b8d7-fdf407c10a45	2026-02	Lalit's Baby	Sangeeta	Paid	150				babyGift
c60472cf-a021-4a9d-ab0d-1261d940d5c6	2026-02	Lalit's Baby	Pawan	Paid	150				babyGift
ff0798f3-ef4d-4441-b513-f9e61ff85672	2026-02	Lalit's Baby	Riddhi	Paid	150				babyGift
64d7e174-3aff-4cda-b84f-94e145b1d532	2026-02	Juhee & Sangeeta	Ankit	Paid	100				birthday
7b5f634d-30dc-4ac9-a65d-d527d50748cd	2026-05	Sumit, Lalit  & Bhakti	Sayali	Paid	100				birthday
13843bbd-0cb2-4f37-ba88-1c67181f08bb	2026-05	Sumit, Lalit  & Bhakti	Nehal	Paid	100				birthday
660f297c-e3d5-4bb9-9264-0900a5ca5359	2026-05	Sumit, Lalit  & Bhakti	Riddhi	Paid	100				birthday
527f89b3-9ca3-436b-81db-32e766c15238	2026-05	Sumit, Lalit  & Bhakti	Sweta	Paid	100				birthday
426aeded-fff3-4d7f-9ca7-28ab3e600068	2026-05	Sumit, Lalit  & Bhakti	Aniket	Paid	100				birthday
42064d9f-4c1f-4ce7-af41-766c753edc10	2026-05	Sumit, Lalit  & Bhakti	Ishwar	Paid	100				birthday
d34b8997-7767-4c28-bdb7-a03b2bcf82e4	2026-02	Lalit's Baby	Ankit	Paid	150				babyGift
ac98b93e-4053-4afe-9fd8-803576a14718	2026-02	Lalit's Baby	Ishwar	Paid	150				babyGift
63b7195f-7400-4f8d-95f8-703151a8e968	2026-02	Lalit's Baby	Juhee	Paid	150				babyGift
2d8d97b9-97c1-4c13-8983-93c5ce6eb4e9	2026-02	Lalit's Baby	Prathamesh	Paid	150				babyGift
b3d68f12-030b-4007-880e-72bb6cdd9224	2026-02	Lalit's Baby	Rupali	Paid	150				babyGift
0d371ba2-c044-4666-b951-d226fece2706	2026-02	Lalit's Baby	Rushab	Paid	150				babyGift
2650fa95-9415-4724-8648-060f2f9aafc0	2026-02	Lalit's Baby	Samiran	Paid	150				babyGift
ccfb13e9-39a3-40e3-93ff-27bcf895442f	2026-02	Lalit's Baby	Sayali	Paid	150				babyGift
d4b4d43a-c7cc-45bb-bfa4-0c686923778f	2026-02	Lalit's Baby	Shivam	Paid	150				babyGift
d95328f5-7536-4968-a66b-6f3e699ae93e	2026-02	Lalit's Baby	Sumit	Paid	150				babyGift
1c5e5dc1-3fa0-4970-a683-b3fbf59a4044	2026-02	Lalit's Baby	Sweta	Paid	150				babyGift
3b345d95-6fb3-4552-88d3-e9b6db638714	2026-02	Lalit's Baby	Lalit	Exempted	0				babyGift
\.


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: birthday_tracker_db_jh26_user
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: records records_pkey; Type: CONSTRAINT; Schema: public; Owner: birthday_tracker_db_jh26_user
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT records_pkey PRIMARY KEY (id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO birthday_tracker_db_jh26_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO birthday_tracker_db_jh26_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO birthday_tracker_db_jh26_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO birthday_tracker_db_jh26_user;


--
-- PostgreSQL database dump complete
--

\unrestrict 0omsfpdVd3vZtJPPUqLQRfBkQvxLU1NM3xbxfTkKCJYaMIdDmHecPSe2TlfkuGi

