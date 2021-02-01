import { ObjectId } from 'mongodb';
import _ from 'lodash';
import {
	AppendOrUpdateMusicsToAlbum, HandleAlbumsFromDz, UpdateAlbumCompleteStatus, UpdateRanksBulk,
} from '../Proxy/DB Proxy';
import { GetMusicOfAlbum as GetMusicsOfAlbum } from '../Proxy/Deezer Proxy/Musics';
import { GetAlbumsOfArtist, SearchMusics } from '../Proxy/Deezer Proxy';
import { ConvertTagsFromDz, ConvertTagsFromDzAlbum } from '../Tags';
import { IAlbum, IArtist, IMusic } from '../Interfaces';
import MopConsole from '../../Tools/MopConsole';
import { GetTrendingMusics } from '../Proxy/Deezer Proxy/Trending';
import { AddMusicToDatabase } from '../Proxy/DB Proxy/Musics';
import { Music } from '../Model';

const Location = 'Musics.Handler.DeezerHandler';

async function CompleteAlbum(AlbumDoc: IAlbum) : Promise<void> {
	const DzMusics = await GetMusicsOfAlbum(AlbumDoc.DeezerId);

	const DzMusicsFormatted = DzMusics.map(
		(DzMusic) => ConvertTagsFromDzAlbum(
			DzMusic,
			AlbumDoc.Name,
			AlbumDoc.DeezerId,
		).ImportedMusic,
	);

	await AppendOrUpdateMusicsToAlbum(DzMusicsFormatted, AlbumDoc.DeezerId);

	const numberModified = await UpdateRanksBulk(DzMusics);
	MopConsole.info(Location, `Updated ranks of ${numberModified} musics`);

	await UpdateAlbumCompleteStatus(AlbumDoc.DeezerId);
}

async function ImportTrendingMusics() : Promise<IMusic[]> {
	const DzMusics = await GetTrendingMusics();
	const DzMusicsFormatted = DzMusics.map((DzMusic) => ConvertTagsFromDz(DzMusic, DzMusic.id));
	const DzIds = DzMusicsFormatted.map((e) => e.ImportedMusic.DeezerId);
	const ExistingMusics = await Music.find({
		DeezerId: { $in: DzIds },
	});

	const TrendingMusics:ObjectId[] = [];
	for (const m of DzMusicsFormatted) {
		const MatchedMusic = ExistingMusics.find((o) => o.DeezerId === m.ImportedMusic.DeezerId);

		if (MatchedMusic) {
			TrendingMusics.push(MatchedMusic._id);
		} else {
			TrendingMusics.push(
				await AddMusicToDatabase(
					m.ImportedMusic,
					m.ImportedAlbum,
					m.ImportedArtist,
				),
			);
		}
	}
	return await Music.find({ _id: { $in: TrendingMusics } }).populate('AlbumId').exec();
}

async function CompleteArtist(ArtistDoc: IArtist) : Promise<void> {
	const DzAlbums = await GetAlbumsOfArtist(ArtistDoc.DeezerId);
	await HandleAlbumsFromDz(ArtistDoc.DeezerId, DzAlbums);
}

export {
	CompleteAlbum,
	CompleteArtist,
	SearchMusics,
	ImportTrendingMusics,
};
