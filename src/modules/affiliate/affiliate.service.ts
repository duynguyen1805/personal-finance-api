import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Affiliate, Package } from './entities/affiliate.entity';
import { Between, In, Repository, TreeRepository } from 'typeorm';
import { pick } from 'lodash';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { EnumAffDirect } from './dto/enum.dto';
import { GetAffParentDto } from './dto/get-parent.dto';
import { UpgradePackageDto } from './dto/upgrade-package.dto';
import { User } from '../user/entities/user.entity';
import { Commission } from './entities/commission.entity';
import { Transactions } from '../transactions/entities/transaction.entity';
import { Coin, TransactionType } from '../transactions/dto/enum.dto';
import { MoveSubTreeDto } from './dto/move-sub-tree.dto';
import { RollbackSubTreeDto } from './dto/rollback-sub-tree.dto';
import { getSolPrice } from '../../shared/get-sol-price.shared';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';

const buyPkgFeePer = +process.env.BUY_PACKAGE_FEE_PERCENT || 5;

@Injectable({ scope: Scope.REQUEST })
export class AffiliateService {
  constructor(
    @Inject(REQUEST) private request: Request,
    @InjectRepository(Affiliate)
    private affRepository: Repository<Affiliate>,
    @InjectRepository(Affiliate)
    private treeAffRepository: TreeRepository<Affiliate>,
    @InjectRepository(Commission)
    private commissionRepository: TreeRepository<Commission>,
    @InjectRepository(Transactions)
    private transactionsRepository: TreeRepository<Transactions>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getTree(address: string) {
    try {
      const aff = await this.affRepository.findOne({
        where: { address },
        relations: ['children']
      });

      if (!aff) {
        return { message: 'Affiliate address is not found' };
      }

      let leftSide = [],
        rightSide = [];

      let totalInLeftBranch = 0;
      let totalInLeftBranchUSD = 0;
      leftSide = await this.treeAffRepository.findDescendants(
        aff.children.find((x) => x.direction === EnumAffDirect.LEFT)
      );
      // if (leftSide.length) {
      //   for (const node of leftSide) {
      //     const packageUsers = await this.packageUserRepository.find({
      //       walletAddress: node.address
      //     });
      //     totalInLeftBranch += packageUsers.reduce(
      //       (sum, item) => sum + Number(item.totalAmount),
      //       0
      //     );
      //     totalInLeftBranchUSD += packageUsers.reduce(
      //       (sum, item) => sum + Number(item.totalUsdt),
      //       0
      //     );
      //   }
      // }

      let totalInRightBranch = 0;
      let totalInRightBranchUSD = 0;
      rightSide = await this.treeAffRepository.findDescendants(
        aff.children.find((x) => x.direction === EnumAffDirect.RIGHT)
      );
      // if (rightSide.length) {
      //   for (const node of rightSide) {
      //     const packageUsers = await this.packageUserRepository.find({
      //       walletAddress: node.address
      //     });
      //     totalInRightBranch += packageUsers.reduce(
      //       (sum, item) => sum + Number(item.totalAmount),
      //       0
      //     );
      //     totalInRightBranchUSD += packageUsers.reduce(
      //       (sum, item) => sum + Number(item.totalUsdt),
      //       0
      //     );
      //   }
      // }

      const user = await this.userRepository.findOne({
        where: { walletAddress: address }
      });

      // total reward
      // const packageUsers = await this.packageUserRepository.find({
      //   userId: user?.id
      // });
      const packageUsers = [];

      const selfSales =
        packageUsers.length > 0
          ? packageUsers.reduce((sum, item) => sum + Number(item.totalUsdt), 0)
          : 0;

      // total commission
      const commissions = await this.commissionRepository.find({
        address: user?.walletAddress
      });

      const directF1 = commissions.filter(
        (c) => c.type === 'DIRECT_F1_COMMISSION'
      );
      const directF2 = commissions.filter(
        (c) => c.type === 'DIRECT_F2_COMMISSION'
      );
      const directF3 = commissions.filter(
        (c) => c.type === 'DIRECT_F3_COMMISSION'
      );
      const binary = commissions.filter((c) => c.type === 'BINARY_COMMISSION');
      const rank = commissions.filter((c) => c.type === 'RANK_COMMISSION');
      const peer = commissions.filter((c) => c.type === 'PEER_COMMISSION');

      const totalCommission =
        commissions.length > 0
          ? commissions.reduce((sum, item) => sum + Number(item.amountUsdt), 0)
          : 0;

      const totalDirectCommission = [
        ...directF1,
        ...directF2,
        ...directF3
      ].reduce((sum, item) => sum + Number(item.amountUsdt), 0);

      const totalBinaryCommission = binary.reduce(
        (sum, item) => sum + Number(item.amountUsdt),
        0
      );

      const totalRankCommission = rank.reduce(
        (sum, item) => sum + Number(item.amountUsdt),
        0
      );

      const totalPeerCommission = peer.reduce(
        (sum, item) => sum + Number(item.amountUsdt),
        0
      );

      // total system sales
      const transactions = await this.transactionsRepository.find({
        where: {
          walletAddress: user?.walletAddress,
          transactionType: In([
            TransactionType.FIXED_INTEREST_REWARD,
            TransactionType.MULTIPLIER_REWARD,
            TransactionType.TOKEN_REWARD
          ]),
          coin: Coin.SOLR
        }
      });

      const solPrice = await getSolPrice();
      if (!(solPrice > 0)) {
        throw new HttpException("Can't get SOL price", HttpStatus.BAD_REQUEST);
      }

      const totalReward =
        transactions.length > 0
          ? transactions.reduce((sum, item) => sum + Number(item.amount), 0)
          : 0;

      // tỷ giá USD
      const solrInSolEx = +(process.env.SOLR_IN_SOL_EX ?? 1000);
      const solrInUsdEx = solPrice / solrInSolEx;
      const totalRewardInUsd = totalReward * solrInUsdEx;

      const f1Invite = await this.affRepository.find({ refAddress: address });

      return {
        tree: await this.treeAffRepository.findDescendantsTree(aff),
        left: {
          invitedNumber: leftSide.length,
          totalIncome: totalInLeftBranchUSD
        },
        right: {
          invitedNumber: rightSide.length,
          totalIncome: totalInRightBranchUSD
        },
        totalReferral: leftSide.length + rightSide.length,
        f1Invite: f1Invite.length || 0,
        totalReward: totalRewardInUsd,
        totalCommission,
        totalDirectCommission,
        totalBinaryCommission,
        totalRankCommission,
        totalPeerCommission,
        totalSystemSales:
          selfSales + totalInLeftBranchUSD + totalInRightBranchUSD
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getTreeByDepth(address: string, depth = 1) {
    if (isNaN(+depth)) {
      return { message: 'Depth must be a number' };
    }
    try {
      const aff = await this.affRepository.findOne({
        where: { address },
        relations: ['children']
      });

      if (!aff) {
        return { message: 'Affiliate address is not found' };
      }

      const user = await this.userRepository.findOne({
        where: { walletAddress: address }
      });

      const f1Invite = await this.affRepository.find({ refAddress: address });

      const leftChild = aff.children.find(
        (x) => x.direction === EnumAffDirect.LEFT
      );
      const rightChild = aff.children.find(
        (x) => x.direction === EnumAffDirect.RIGHT
      );

      const fetchBranchData = async (childNode: Affiliate | undefined) => {
        if (!childNode)
          return {
            invitedNumber: 0,
            totalAmount: 0,
            totalUsdt: 0,
            descendants: []
          };

        const descendants = await this.treeAffRepository.findDescendants(
          childNode
        );
        let totalAmount = 0;
        let totalUsdt = 0;

        for (const node of descendants) {
          // const packages = await this.packageUserRepository.find({
          //   walletAddress: node.address
          // });
          const packages = [];
          totalAmount += packages.reduce(
            (sum, item) => sum + Number(item.totalAmount),
            0
          );
          totalUsdt += packages.reduce(
            (sum, item) => sum + Number(item.totalUsdt),
            0
          );
        }

        return {
          invitedNumber: descendants.length,
          totalAmount,
          totalUsdt,
          descendants
        };
      };

      const leftBranch = await fetchBranchData(leftChild);
      const rightBranch = await fetchBranchData(rightChild);

      // Tính self sales
      // const packageUsers = await this.packageUserRepository.find({
      //   userId: user?.id
      // });
      const packageUsers = [];
      const selfSales = packageUsers.reduce(
        (sum, item) => sum + Number(item.totalUsdt),
        0
      );

      // Commission
      const commissions = await this.commissionRepository.find({
        address: user?.walletAddress
      });

      const calcCommission = (types: string[]) => {
        return commissions
          .filter((c) => types.includes(c.type))
          .reduce((sum, item) => sum + Number(item.amountUsdt), 0);
      };

      const totalCommission = calcCommission([
        'DIRECT_F1_COMMISSION',
        'DIRECT_F2_COMMISSION',
        'DIRECT_F3_COMMISSION',
        'BINARY_COMMISSION',
        'RANK_COMMISSION',
        'PEER_COMMISSION'
      ]);
      const totalDirectCommission = calcCommission([
        'DIRECT_F1_COMMISSION',
        'DIRECT_F2_COMMISSION',
        'DIRECT_F3_COMMISSION'
      ]);
      const totalBinaryCommission = calcCommission(['BINARY_COMMISSION']);
      const totalRankCommission = calcCommission(['RANK_COMMISSION']);
      const totalPeerCommission = calcCommission(['PEER_COMMISSION']);

      // Rewards
      const transactions = await this.transactionsRepository.find({
        where: {
          walletAddress: user?.walletAddress,
          transactionType: In([
            TransactionType.FIXED_INTEREST_REWARD,
            TransactionType.MULTIPLIER_REWARD,
            TransactionType.TOKEN_REWARD
          ]),
          coin: Coin.SOLR
        }
      });

      const solPrice = await getSolPrice();
      if (!(solPrice > 0)) {
        throw new HttpException("Can't get SOL price", HttpStatus.BAD_REQUEST);
      }

      const totalReward = transactions.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );
      const solrInSolEx = +(process.env.SOLR_IN_SOL_EX ?? 1000);
      const solrInUsdEx = solPrice / solrInSolEx;
      const totalRewardInUsd = totalReward * solrInUsdEx;

      // Trả về sơ đồ cây với depth control + hasChildren
      const tree = await this.treeAffRepository.findDescendantsTree(aff, {
        depth
      });

      const mapTreeWithHasChildren = async (node: Affiliate): Promise<any> => {
        const hasChildCount = await this.affRepository.count({
          where: { parent: { id: node.id } }
        });

        return {
          address: node.address,
          direction: node.direction,
          level: node.level,
          rank: node.rank,
          totalPkgAmount: node.totalPkgAmount,
          totalBuyPkgFee: node.totalBuyPkgFee,
          totalVolume: node.totalVolume,
          weakBranchVolume: node.weakBranchVolume,
          hasChildren: hasChildCount > 0,
          children: node.children?.length
            ? await Promise.all(
                node.children.map((child) => mapTreeWithHasChildren(child))
              )
            : []
        };
      };

      const processedTree = await mapTreeWithHasChildren(tree);

      return {
        tree: processedTree,
        left: {
          invitedNumber: leftBranch.invitedNumber,
          totalIncome: leftBranch.totalUsdt
        },
        right: {
          invitedNumber: rightBranch.invitedNumber,
          totalIncome: rightBranch.totalUsdt
        },
        totalReferral: leftBranch.invitedNumber + rightBranch.invitedNumber,
        f1Invite: f1Invite.length || 0,
        totalReward: totalRewardInUsd,
        totalCommission,
        totalDirectCommission,
        totalBinaryCommission,
        totalRankCommission,
        totalPeerCommission,
        totalSystemSales:
          selfSales + leftBranch.totalUsdt + rightBranch.totalUsdt
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findParent(address: string, dto: GetAffParentDto) {
    try {
      const ref = await this.affRepository.findOne({
        address: dto.refAddress
      });

      if (!ref) {
        return { message: 'Referral address is not found' };
      }

      const currentAff = await this.affRepository.findOne({
        address
      });

      if (currentAff) {
        return { message: 'Address is existed' };
      }

      let descendants = await this.treeAffRepository.findDescendants(ref);
      if (descendants.length > 0) {
        descendants = descendants.filter((x) => x.direction === +dto.direction);
        const maxLevel = Math.max(...descendants.map((x) => x.level));
        descendants = descendants
          .filter((x) => x.level === maxLevel)
          .sort((x) => Number(x.position));
      }

      let parent = ref;
      if (descendants.length > 0) {
        parent =
          dto.direction === EnumAffDirect.LEFT
            ? descendants[0]
            : descendants[descendants.length - 1];
      }

      return parent;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async addChild(dto: CreateAffiliateDto) {
    try {
      const ref = await this.affRepository.findOne({
        address: dto.refAddress
      });

      if (!ref) {
        return { message: 'Referral address is not found', data: null };
      }

      const currentAff = await this.affRepository.findOne({
        address: dto.address
      });

      if (currentAff) {
        return { message: 'Address is existed', data: null };
      }

      let descendants = await this.treeAffRepository.findDescendants(ref);
      if (descendants.length > 0) {
        descendants = descendants.filter((x) => x.direction === +dto.direction);
        const maxLevel = Math.max(...descendants.map((x) => x.level));
        descendants = descendants
          .filter((x) => x.level === maxLevel)
          .sort((a, b) => {
            const posA = BigInt(a.position);
            const posB = BigInt(b.position);
            return posA < posB ? -1 : posA > posB ? 1 : 0;
          });
      }

      let parent = ref;
      if (descendants.length > 0) {
        parent =
          dto.direction === EnumAffDirect.LEFT
            ? descendants[0]
            : descendants[descendants.length - 1];
      }

      const amount = dto?.packageAmount ? dto.packageAmount : 0;
      const pkgAmount = (amount * (100 - buyPkgFeePer)) / 100;
      const buyPkgFee = (amount * buyPkgFeePer) / 100;

      const parentPos = BigInt(parent.position); // parent.position là string, convert sang BigInt
      const direction = BigInt(+dto.direction);
      const newPosition =
        direction - BigInt(1) + BigInt(2) * parentPos + BigInt(1);

      const newAff = await this.affRepository.create({
        ...pick(dto, Object.keys(dto)),
        parent:
          descendants.length > 0 ? descendants[descendants.length - 1] : ref,
        position: newPosition.toString(),
        level: parent.level + 1,
        totalPkgAmount: pkgAmount,
        totalBuyPkgFee: buyPkgFee,
        packages: [{ pkgAmount, buyPkgFee }]
      } as Affiliate);

      await this.affRepository.save(newAff);

      return { data: newAff, message: 'Add child node is successful' };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async upgradePackage(dto: UpgradePackageDto) {
    try {
      const aff = await this.affRepository.findOne({
        where: { address: dto.address },
        relations: ['parent']
      });

      if (!aff) {
        return { message: 'Address is not existed', data: null };
      }

      const pkgAmount = (dto.packageAmount * (100 - buyPkgFeePer)) / 100;
      const buyPkgFee = (dto.packageAmount * buyPkgFeePer) / 100;

      // init array
      if (!aff.packages) {
        aff.packages = [];
      }

      aff.packages.push({
        pkgAmount,
        buyPkgFee
      } as Package);

      await this.affRepository.update(aff.id, {
        totalPkgAmount: +aff.totalPkgAmount + pkgAmount,
        totalBuyPkgFee: +aff.totalBuyPkgFee + buyPkgFee,
        packages: aff.packages
      });

      return {
        data: {
          ...aff,
          totalPkgAmount: +aff.totalPkgAmount + pkgAmount,
          totalBuyPkgFee: +aff.totalBuyPkgFee + buyPkgFee,
          packages: aff.packages
        }
      };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async moveSubTree(dto: MoveSubTreeDto) {
    dto.includeSelf = true;

    const oldNode = await this.affRepository.findOne({
      where: { address: dto.oldAddress },
      relations: ['children']
    });

    if (!oldNode) {
      throw new HttpException('Old node not found', HttpStatus.BAD_REQUEST);
    }

    const newParent = await this.affRepository.findOne({
      where: { address: dto.newParentAddress },
      relations: ['children']
    });

    if (!newParent) {
      throw new HttpException('New parent not found', HttpStatus.BAD_REQUEST);
    }

    if (dto.includeSelf) {
      // move nguyên oldNode và toàn bộ cây con
      const fullSubTree = await this.treeAffRepository.findDescendantsTree(
        oldNode
      );
      await this.updateSubTree(fullSubTree, newParent, EnumAffDirect.RIGHT); // hardcode bên phải
    } else {
      // chỉ move các con của oldNode
      for (const child of oldNode.children || []) {
        const fullSubTree = await this.treeAffRepository.findDescendantsTree(
          child
        );
        await this.updateSubTree(fullSubTree, newParent, EnumAffDirect.RIGHT); // hardcode bên phải
      }
    }

    return {
      message: dto.includeSelf
        ? 'Moved old node and its subtree successfully'
        : 'Moved children of old node to new parent successfully'
    };
  }

  async updateSubTree(node: Affiliate, parent: Affiliate, dir: number) {
    const parentPos = BigInt(parent.position);
    const direction = BigInt(dir); // LEFT = 1, RIGHT = 2
    const newPos = direction - BigInt(1) + BigInt(2) * parentPos + BigInt(1);

    const levelDiff = parent.level + 1 - node.level;

    // update node gốc
    node.parent = parent;
    node.position = newPos.toString();
    node.level = parent.level + 1;
    node.direction = dir;

    await this.affRepository.save(node);

    // đệ quy qua các children
    for (const child of node.children || []) {
      child.level += levelDiff;
      child.position = (
        BigInt(node.position) * BigInt(2) +
        BigInt(child.direction - 1) +
        BigInt(1)
      ).toString();
      child.parent = node;

      await this.updateSubTree(child, node, child.direction);
    }
  }

  async countAffiliateDescendants(address: string): Promise<number> {
    const aff = await this.affRepository.findOne({
      where: { address }
    });

    if (!aff) {
      throw new HttpException(
        `Affiliate with address ${address} not found`,
        HttpStatus.BAD_REQUEST
      );
    }

    const descendants = await this.treeAffRepository.findDescendants(aff);
    return descendants.length - 1; // Trừ chính nó
  }

  async rollbackMoveSubTreeAutoDirection(dto: RollbackSubTreeDto) {
    const from = new Date(dto.fromTime);
    const to = new Date(dto.toTime);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new HttpException('Invalid time format', HttpStatus.BAD_REQUEST);
    }

    const oldNode = await this.affRepository.findOne({
      where: { address: dto.oldAddress }
    });

    if (!oldNode) {
      throw new HttpException('Old node not found', HttpStatus.BAD_REQUEST);
    }

    const movedNodes = await this.affRepository.find({
      where: {
        updatedAt: Between(from, to)
      },
      relations: ['children', 'parent']
    });

    if (movedNodes.length === 0) {
      return { message: 'No nodes updated in given time range' };
    }

    const subtreeRoots = movedNodes.filter(
      (n) =>
        n.parent?.address === dto.newAddress &&
        n.address !== dto.newAddress && // loại bỏ chính newParent
        n.address !== dto.oldAddress // loại bỏ oldNode
    );

    if (subtreeRoots.length === 0) {
      return { message: 'No subtree roots matched for rollback' };
    }

    for (const child of subtreeRoots) {
      const fullTree = await this.treeAffRepository.findDescendantsTree(child);

      // xác định direction dựa theo position
      const pos = BigInt(child.position);
      const dir =
        (pos - BigInt(1)) % BigInt(2) === BigInt(0)
          ? EnumAffDirect.LEFT
          : EnumAffDirect.RIGHT;

      await this.updateSubTree(fullTree, oldNode, dir);
    }

    return {
      message: 'Rollback with auto direction successful',
      totalMovedBack: subtreeRoots.length
    };
  }

  // async getDescendantsByDepth(address: string, maxDepth: number): Promise<string[][]> {
  //   const rootNode = await this.affRepository.findOne({
  //     where: { address },
  //     relations: ['children'],
  //   });

  //   if (!rootNode) {
  //     throw new HttpException('Address not found', HttpStatus.NOT_FOUND);
  //   }

  //   const result: string[][] = [];

  //   // Queue để duyệt từng tầng (BFS)
  //   let currentLevel: Affiliate[] = [rootNode];

  //   for (let depth = 0; depth < maxDepth; depth++) {
  //     const nextLevel: Affiliate[] = [];
  //     const currentWallets: string[] = [];

  //     for (const node of currentLevel) {
  //       const fullNode = await this.affRepository.findOne({
  //         where: { id: node.id },
  //         relations: ['children'],
  //       });

  //       for (const child of fullNode.children || []) {
  //         currentWallets.push(child.address);
  //         nextLevel.push(child);
  //       }
  //     }

  //     if (currentWallets.length === 0) {
  //       break; // Không còn tầng tiếp theo
  //     }

  //     result.push(currentWallets);
  //     currentLevel = nextLevel;
  //   }

  //   return result;
  // }

  // async getDescendantsByDepth(
  //   address: string,
  //   maxDepth: number
  // ): Promise<
  //   {
  //     walletAddress: string;
  //     packageUser: PackageUser | null;
  //   }[][]
  // > {
  //   const rootNode = await this.affRepository.findOne({
  //     where: { address },
  //     relations: ['children']
  //   });

  //   if (!rootNode) {
  //     throw new HttpException('Address not found', HttpStatus.NOT_FOUND);
  //   }

  //   const result: {
  //     walletAddress: string;
  //     packageUser: PackageUser | null;
  //   }[][] = [];

  //   let currentLevel: Affiliate[] = [rootNode];

  //   for (let depth = 0; depth < maxDepth; depth++) {
  //     const nextLevel: Affiliate[] = [];
  //     const currentLevelResult: {
  //       walletAddress: string;
  //       packageUser: PackageUser | null;
  //     }[] = [];

  //     for (const node of currentLevel) {
  //       const fullNode = await this.affRepository.findOne({
  //         where: { id: node.id },
  //         relations: ['children']
  //       });

  //       for (const child of fullNode.children || []) {
  //         const packageUser = await this.packageUserRepository.findOne({
  //           where: { walletAddress: child.address }
  //         });

  //         currentLevelResult.push({
  //           walletAddress: child.address,
  //           packageUser: packageUser || null
  //         });

  //         nextLevel.push(child);
  //       }
  //     }

  //     if (currentLevelResult.length === 0) {
  //       break;
  //     }

  //     result.push(currentLevelResult);
  //     currentLevel = nextLevel;
  //   }

  //   return result;
  // }
}
