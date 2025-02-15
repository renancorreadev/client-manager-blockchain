import { Inject, Injectable, Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { PointsBlockchainTokenOutputPort } from '@/src/modules/Blockchain/Points/Port/Output/PointsBlockchainTokenOutputPort';
import {
	AddPointsRequestDto,
	RemovePointsRequestDTO,
	SetDrexAddressRequestDTO,
} from '../../Domain/Dto/HTTPRequest/AddPointsRequestDto';
import { DependencyInjectionBlockchainConnector, DependencyInjectionTokens } from '@helper/AppConstants';
import { PointsManagerConnector } from '@helper/blockchain/connector';
import { BalanceOfBatchParam, BalanceOfParam } from '@helper/blockchain/types/contracts/points-core-types';
import { PointsDBStorageAdapter } from './PointsDBStorageAdapter';

config();

@Injectable()
export class PointsBlockchainAdapter implements PointsBlockchainTokenOutputPort {
	private readonly logger = new Logger('PointsBlockchainAdapter');

	constructor(
		@Inject(DependencyInjectionBlockchainConnector.POINTS_MANAGER_CONNECTOR)
		private contractInstance: PointsManagerConnector,

		@Inject(DependencyInjectionTokens.POINTS_DB_STORAGE_OUTPUT_PORT)
		private readonly pointDBStorage: PointsDBStorageAdapter,
	) {}

	async addPoints(registerClientBlockchainDto: AddPointsRequestDto): Promise<string> {
		try {
			const { clientId, points } = registerClientBlockchainDto;

			const transaction = await this.contractInstance.addPoints({
				clientId,
				points,
			});

			if (transaction.hash) {
				// Atualize o banco de dados apenas se a transação na blockchain for bem-sucedida
				await this.pointDBStorage.addPointsOnDb(clientId, points);
			} else {
				throw new Error(`An error occurred in write contract addPoints function on blockchain`);
			}

			return 'Points added successfully on blockchain and saved in db';
		} catch (e) {
			const errorMessage = e.response ? e.response.data : e.message;
			this.logger.error(`Error: ${JSON.stringify(errorMessage)}`);
			throw new Error(`An error occurred in write contract addPoints function on blockchain`);
		}
	}

	async removePoints(removePointsDTO: RemovePointsRequestDTO): Promise<string> {
		try {
			const { clientId, points } = removePointsDTO;

			const transaction = await this.contractInstance.removePoints({
				clientId,
				points,
			});

			if (transaction.hash) {
				// Atualize o banco de dados apenas se a transação na blockchain for bem-sucedida
				await this.pointDBStorage.deletePointsOnDb(clientId, points);
			} else {
				throw new Error(`An error occurred in write contract removePoints function on blockchain`);
			}

			return 'Points removed successfully on blockchain and saved in db';
		} catch (e) {
			const errorMessage = e.response ? e.response.data : e.message;
			this.logger.error(`Error: ${JSON.stringify(errorMessage)}`);
			throw new Error(`An error occurred in write contract removePoints function on blockchain`);
		}
	}

	async setDrexContractAddress(setDrexNewAddress: SetDrexAddressRequestDTO): Promise<string> {
		try {
			const { newAddress } = setDrexNewAddress;

			const transaction = await this.contractInstance.setDrexContractAddress({
				newAddress,
			});

			if (transaction.hash) {
				return `The Contract Address changed to ${newAddress}`;
			} else {
				throw new Error(`An error occurred in write contract removePoints function on blockchain`);
			}
		} catch (e) {
			const errorMessage = e.response ? e.response.data : e.message;
			this.logger.error(`Error: ${JSON.stringify(errorMessage)}`);
			throw new Error(`An error occurred in write contract removePoints function on blockchain`);
		}
	}

	async getClientPoints(clientId: number): Promise<number> {
		try {
			return await this.contractInstance.getClientPoints(clientId);
		} catch (e) {
			const errorMessage = e.response ? e.response.data : e.message;
			this.logger.error(`Error : ${JSON.stringify(errorMessage)}`);
			throw new Error(`An error ocurred in read contract getClientPoints function on blockchain `);
		}
	}

	async getClientLevel(clientId: number): Promise<number> {
		try {
			return await this.contractInstance.getClientLevel(clientId);
		} catch (e) {
			const errorMessage = e.response ? e.response.data : e.message;
			this.logger.error(`Error : ${JSON.stringify(errorMessage)}`);
			throw new Error(`An error ocurred in read contract getClientLevel function on blockchain `);
		}
	}

	async getMultiplesNFT(params: BalanceOfBatchParam) {
		try {
			const { accounts, ids } = params;

			return await this.contractInstance.getBalanceOfBatch({
				accounts,
				ids,
			});
		} catch (e) {
			const errorMessage = e.response ? e.response.data : e.message;
			this.logger.error(`Error : ${JSON.stringify(errorMessage)}`);
			throw new Error(`An error ocurred in read contract getNFTsByusers function on blockchain `);
		}
	}

	async getUniqueNFT(params: BalanceOfParam): Promise<number> {
		try {
			const { account, id } = params;

			return await this.contractInstance.getBalanceOf(account, id);
		} catch (e) {
			const errorMessage = e.response ? e.response.data : e.message;
			this.logger.error(`Error : ${JSON.stringify(errorMessage)}`);
			throw new Error(`An error ocurred in read contract getUniqueNFT function on blockchain adapter `);
		}
	}

	async getContractVersion(): Promise<string> {
		try {
			return await this.contractInstance.getContractVersion();
		} catch (e) {
			const errorMessage = e.response ? e.response.data : e.message;
			this.logger.error(`Error : ${JSON.stringify(errorMessage)}`);
			throw new Error(`An error ocurred in read contract getContractVersion function on blockchain adapter `);
		}
	}
}
