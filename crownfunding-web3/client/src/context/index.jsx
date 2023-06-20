import React, { useContext, createContext } from "react";

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react'
import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const { data: contract } = useContract('0xE1CD8d27027C964aFD0Ad8bC6cCD704ea8f2832E');
    const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

    const connect = useMetamask();
    const address = useAddress();

    const publishCampaign = async ({ title, description, target, deadline, image }) => {
        try {
            const data = await createCampaign({ args: [
                address,
                title,
                description,
                target,
                new Date(deadline).getTime(),
                image
            ]})

            console.log("contract call success", data);
        } catch (error) {
            console.log("contract call failure", error);
        }
    }

    const getCampaigns = async () => {
        const campaigns = await contract.call('getCampaigns');

        const parsedCampaigns = campaigns.map((campaign, i) => ({
            owner: campaign.owner, 
            title: campaign.title, 
            description: campaign.description, 
            image: campaign.image, 
            deadline: campaign.deadline.toNumber(),
            target: ethers.utils.formatEther(campaign.target.toString()),
            amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
            pId: i 
        }));
        
        return parsedCampaigns;
    }

    const getUserCampaigns = async () => {
        const allCampaigns = await getCampaigns();
    
        const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);
    
        return filteredCampaigns;
      }

    const getDonations = async (pId) => {
        console.log({ pId });
        const donations = await contract.call('getDonators', [pId]);
        const numberOfDonations = donations[0].length;

        const parsedDonations = [];

        for(let i = 0; i < numberOfDonations; i++) {
            parsedDonations.push({
                donator: donations[0][i],
                donation: ethers.utils.formatEther(donations[1][i].toString())
            });
        }

        return parsedDonations;
    }

    const donate = async (pId, amount) => {
        const data = await contract.call('donateCampaign', [pId], { value: ethers.utils.parseEther(amount)});

        return data;
    }

    return (
        <StateContext.Provider value={{
            contract,
            address,
            connect,
            getCampaigns,
            getUserCampaigns,
            createCampaign: publishCampaign,
            getDonations,
            donate
        }}>
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);

