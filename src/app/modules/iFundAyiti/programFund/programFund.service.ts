import { ProgramFund } from './programFund.model';



const getFundBalanceFromDB = async () => {
  const stats = await ProgramFund.aggregate([
    {
      $group: {
        _id: null,
        totalDonations: {
          $sum: {
            $cond: [{ $eq: ['$type', 'Donation'] }, '$amount', 0],
          },
        },
        totalGrants: {
          $sum: {
            $cond: [{ $eq: ['$type', 'Grant'] }, '$amount', 0],
          },
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      balance: 0,
      totalDonations: 0,
      totalGrants: 0,
    };
  }

  const { totalDonations, totalGrants } = stats[0];
  return {
    balance: totalDonations - totalGrants,
    totalDonations,
    totalGrants,
  };
};

export const ProgramFundServices = {
  getFundBalanceFromDB,
};
